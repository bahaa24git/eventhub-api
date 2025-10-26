from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, Max
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from .models import (
    Project, ProjectMember, Label, Task, Subtask,
    Comment, Attachment
)
from .serializers import (
    ProjectSerializer, ProjectMemberSerializer, LabelSerializer,
    TaskSerializer, SubtaskSerializer,
    CommentSerializer, AttachmentSerializer,
    ProjectDashboardSerializer
)
from .permissions import (
    IsProjectMember, IsOwnerOrAdmin, IsTaskAssigneeOrAdmin, IsNotViewer
)
from rest_framework import status
from django.contrib.auth import get_user_model

from io import BytesIO
from django.http import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from events.models import ActivityLog
User = get_user_model()


# --------------------------------------------------------------------
# 🧩 Projects
# Everyone in a project can view. Only OWNER or ADMIN can modify.
# --------------------------------------------------------------------
class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(members__user=self.request.user).distinct()

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        project = serializer.save(created_by=self.request.user)
        ProjectMember.objects.create(
            project=project, user=self.request.user, role=ProjectMember.Role.OWNER
        )

    @action(
        detail=True,
        methods=["get"],
        url_path="dashboard",
        permission_classes=[permissions.IsAuthenticated, IsProjectMember],
    )
    def dashboard(self, request, pk=None):
        project = self.get_object()

        # ---- Basic counts ----
        total_tasks = Task.objects.filter(project=project, deleted_at__isnull=True).count()
        completed_tasks = Task.objects.filter(project=project, status="DONE").count()
        pending_tasks = total_tasks - completed_tasks

        total_subtasks = Subtask.objects.filter(task__project=project).count()
        completed_subtasks = Subtask.objects.filter(task__project=project, is_done=True).count()

        members_count = ProjectMember.objects.filter(project=project).count()
        labels_count = Label.objects.filter(project=project).count()
        comments_count = Comment.objects.filter(task__project=project).count()
        attachments_count = Attachment.objects.filter(task__project=project).count()

        # ---- Overdue tasks ----
        today = timezone.now().date()
        overdue_tasks = Task.objects.filter(
            project=project,
            due_date__lt=today,
            status__in=["TODO", "IN_PROGRESS", "BLOCKED"],
            deleted_at__isnull=True
        ).count()

        # ---- Last activity ----
        last_activity = (
            Task.objects.filter(project=project).aggregate(last=Max("updated_at"))["last"]
            or project.updated_at
        )

        # ---- Combine all ----
        data = {
            "project_id": project.id,
            "project_name": project.name,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "total_subtasks": total_subtasks,
            "completed_subtasks": completed_subtasks,
            "members_count": members_count,
            "labels_count": labels_count,
            "comments_count": comments_count,
            "attachments_count": attachments_count,
            "last_activity": last_activity,
            "overdue_tasks": overdue_tasks,
        }

        serializer = ProjectDashboardSerializer(data)
        return Response(serializer.data)

    # ✅ NEW: Archive / Unarchive project
    @action(
        detail=True,
        methods=["post"],
        url_path="archive",
        permission_classes=[permissions.IsAuthenticated, IsOwnerOrAdmin],
    )
    def toggle_archive(self, request, pk=None):
        """Toggle a project's archived status (Active ↔ Archived)."""
        project = self.get_object()
        project.is_archived = not project.is_archived
        project.save()

        # Optional: log the action
        ActivityLog.objects.create(
            project=project,
            user=request.user,
            action="archived" if project.is_archived else "unarchived",
            object_type="Project",
            description=f"{request.user.username} {'archived' if project.is_archived else 'unarchived'} the project {project.name}."
        )

        return Response(
            {
                "message": f"Project {'archived' if project.is_archived else 'unarchived'} successfully.",
                "is_archived": project.is_archived,
            },
            status=status.HTTP_200_OK,
        )


# --------------------------------------------------------------------
# 🧩 Project Members
# Visible to all members, editable only by OWNER/ADMIN
# --------------------------------------------------------------------
class ProjectMemberViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]

    def get_queryset(self):
        return ProjectMember.objects.filter(project_id=self.kwargs["project_pk"])

    def perform_create(self, serializer):
        project_id = self.kwargs.get("project_pk")
        user_id = self.request.data.get("user_id")  # 👈 Expect this in the request

        if not user_id:
            raise serializers.ValidationError({"user_id": "This field is required."})

        project = get_object_or_404(Project, id=project_id)
        user = get_object_or_404(User, id=user_id)

        # prevent duplicates
        if ProjectMember.objects.filter(project=project, user=user).exists():
            raise serializers.ValidationError("User is already a member of this project.")

        role = self.request.data.get("role", ProjectMember.Role.MEMBER)
        serializer.save(project=project, user=user, role=role)


# --------------------------------------------------------------------
# 🧩 Labels
# All members can view; only OWNER/ADMIN can modify
# --------------------------------------------------------------------
class LabelViewSet(viewsets.ModelViewSet):
    serializer_class = LabelSerializer

    def get_queryset(self):
        return Label.objects.filter(project_id=self.kwargs["project_pk"])

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated(), IsProjectMember()]

    def perform_create(self, serializer):
        serializer.save(project_id=self.kwargs["project_pk"])


# --------------------------------------------------------------------
# 🧩 Tasks
# Everyone can read; OWNER/ADMIN can edit all;
# Members can manage their own; Viewers are read-only.
# --------------------------------------------------------------------
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsProjectMember,
        IsNotViewer,
        IsTaskAssigneeOrAdmin,
    ]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["priority", "due_date", "created_at"]

    def get_queryset(self):
        project_id = self.kwargs.get("project_pk")
        qs = Task.objects.filter(project_id=project_id, deleted_at__isnull=True)

        # Optional filters
        params = self.request.query_params
        if "status" in params:
            qs = qs.filter(status=params["status"])
        if "assignee" in params:
            qs = qs.filter(assignees__user__id=params["assignee"])
        if "label" in params:
            qs = qs.filter(task_labels__label__id=params["label"])
        if "due_before" in params:
            qs = qs.filter(due_date__lte=params["due_before"])

        return qs.distinct()

    def perform_create(self, serializer):
        project = get_object_or_404(Project, id=self.kwargs["project_pk"])
        serializer.save(project=project, creator=self.request.user)

    def perform_update(self, serializer):
        project = get_object_or_404(Project, id=self.kwargs["project_pk"])
        serializer.save(project=project)

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)

    def perform_destroy(self, instance):
        if hasattr(instance, "deleted_at"):
            instance.deleted_at = timezone.now()
            instance.save()
        else:
            instance.delete()


# --------------------------------------------------------------------
# 🧩 Subtasks
# Viewers = read-only
# Members = can mark is_done ✅ / ❌
# Admins/Owners = full control
# --------------------------------------------------------------------
class SubtaskViewSet(viewsets.ModelViewSet):
    serializer_class = SubtaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]

    def get_queryset(self):
        return Subtask.objects.filter(task_id=self.kwargs["task_pk"])

    def perform_create(self, serializer):
        serializer.save(task_id=self.kwargs["task_pk"])

    def update(self, request, *args, **kwargs):
        # Members can only toggle is_done, admins/owners full update
        subtask = self.get_object()
        member = ProjectMember.objects.filter(project=subtask.task.project, user=request.user).first()

        if not member:
            return Response({"detail": "Not a member."}, status=403)

        if member.role in ["OWNER", "ADMIN"]:
            return super().update(request, *args, **kwargs)

        if member.role == "MEMBER":
            allowed = set(request.data.keys())
            if not allowed.issubset({"is_done"}):
                return Response({"detail": "You may only toggle completion status."}, status=403)
            return super().update(request, *args, **kwargs)

        return Response({"detail": "Not allowed."}, status=403)


# --------------------------------------------------------------------
# 🧩 Comments
# All members can view; only non-viewers can write.
# --------------------------------------------------------------------
class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember, IsNotViewer]

    def get_queryset(self):
        return Comment.objects.filter(task_id=self.kwargs["task_pk"])

    def perform_create(self, serializer):
        serializer.save(task_id=self.kwargs["task_pk"], author=self.request.user)


# --------------------------------------------------------------------
# 🧩 Attachments
# All members can view; only non-viewers can upload/delete.
# --------------------------------------------------------------------
class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember, IsNotViewer]

    def get_queryset(self):
        return Attachment.objects.filter(task_id=self.kwargs["task_pk"])

    def perform_create(self, serializer):
        file_obj = self.request.FILES.get("file")
        serializer.save(
            task_id=self.kwargs["task_pk"],
            uploader=self.request.user,
            filename=file_obj.name if file_obj else "",
            size=file_obj.size if file_obj else 0,
        )


# projects/views.py

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def project_report(request, pk):
    """Generate a simple text-style project summary PDF that matches dashboard."""
    try:
        project = Project.objects.get(pk=pk)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=404)

    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)

    # --- Header ---
    p.setFont("Helvetica-Bold", 18)
    p.drawString(200, 800, "■ Project Report")

    p.setFont("Helvetica-Bold", 14)
    p.drawString(60, 770, f"Project: {project.name}")
    p.setFont("Helvetica", 12)
    p.drawString(60, 750, f"Description: {project.description or '-'}")
    p.drawString(60, 730, f"Created at: {project.created_at.strftime('%Y-%m-%d')}")

    # --- Dashboard Stats ---
    total_tasks = Task.objects.filter(project=project, deleted_at__isnull=True).count()
    completed_tasks = Task.objects.filter(project=project, status="DONE").count()
    total_subtasks = Subtask.objects.filter(task__project=project).count()
    completed_subtasks = Subtask.objects.filter(task__project=project, is_done=True).count()
    members_count = ProjectMember.objects.filter(project=project).count()
    labels_count = Label.objects.filter(project=project).count()
    comments_count = Comment.objects.filter(task__project=project).count()
    attachments_count = Attachment.objects.filter(task__project=project).count()
    today = timezone.now().date()
    overdue_tasks = Task.objects.filter(
        project=project,
        due_date__lt=today,
        status__in=["TODO", "IN_PROGRESS", "BLOCKED"],
        deleted_at__isnull=True,
    ).count()

    # Completion %
    task_completion = (completed_tasks / total_tasks * 100) if total_tasks else 0
    subtask_completion = (completed_subtasks / total_subtasks * 100) if total_subtasks else 0

    y = 700
    p.setFont("Helvetica", 12)
    stats = [
        ("Total Tasks", total_tasks),
        ("Completed Tasks", completed_tasks),
        ("Subtasks", total_subtasks),
        ("Completed Subtasks", completed_subtasks),
        ("Task Completion", f"{task_completion:.0f}%"),
        ("Subtask Completion", f"{subtask_completion:.0f}%"),
        ("Members", members_count),
        ("Labels", labels_count),
        ("Comments", comments_count),
        ("Attachments", attachments_count),
        ("Overdue Tasks", overdue_tasks),
    ]
    for name, val in stats:
        p.drawString(60, y, f"{name}: {val}")
        y -= 20

    # --- Activity Logs ---
    y -= 20
    p.setFont("Helvetica-Bold", 14)
    p.drawString(60, y, "Recent Activity:")
    p.setFont("Helvetica", 12)
    y -= 20

    logs = ActivityLog.objects.filter(project=project).order_by("-timestamp")[:10]
    if not logs:
        p.drawString(80, y, "No recent activity recorded.")
    else:
        for log in logs:
            username = log.user.username if log.user else "System"
            obj = log.object_type or "Object"
            action = log.action or ""
            desc = log.description or ""
            time = log.timestamp.strftime("%Y-%m-%d %H:%M")
            p.drawString(80, y, f"- [{time}] {username} {action} {obj}: {desc[:60]}")
            y -= 20
            if y < 60:
                p.showPage()
                y = 780

    p.showPage()
    p.save()
    buffer.seek(0)

    filename = f"{project.name.replace(' ', '_')}_Report.pdf"
    return FileResponse(buffer, as_attachment=True, filename=filename)