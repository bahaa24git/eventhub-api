from rest_framework import viewsets, permissions, filters
from django.db.models import Q
from .models import (
    Project, ProjectMember, Label, Task, Subtask,
    TaskAssignee, Comment, Attachment
)
from .serializers import (
    ProjectSerializer, ProjectMemberSerializer, LabelSerializer,
    TaskSerializer, SubtaskSerializer, TaskAssigneeSerializer,
    CommentSerializer, AttachmentSerializer
)


# --- Custom Permission ---
class IsProjectMember(permissions.BasePermission):
    """Allow access only to members of the project."""
    def has_object_permission(self, request, view, obj):
        # Handles models that have a direct or indirect link to Project
        project = getattr(obj, "project", None)
        if not project and hasattr(obj, "task"):
            project = obj.task.project
        if not project:
            return False
        return ProjectMember.objects.filter(project=project, user=request.user).exists()


# --- Project ---
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Show only projects where user is a member
        return Project.objects.filter(members__user=self.request.user)

    def perform_create(self, serializer):
        project = serializer.save(created_by=self.request.user)
        ProjectMember.objects.create(
            project=project, user=self.request.user, role=ProjectMember.Role.OWNER
        )


# --- Project Members ---
class ProjectMemberViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]

    def get_queryset(self):
        return ProjectMember.objects.filter(project_id=self.kwargs["project_pk"])

    def perform_create(self, serializer):
        serializer.save(project_id=self.kwargs["project_pk"])


# --- Labels ---
class LabelViewSet(viewsets.ModelViewSet):
    serializer_class = LabelSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]

    def get_queryset(self):
        return Label.objects.filter(project_id=self.kwargs["project_pk"])

    def perform_create(self, serializer):
        serializer.save(project_id=self.kwargs["project_pk"])


# --- Tasks ---
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["priority", "due_date", "created_at"]

    def get_queryset(self):
        project_id = self.kwargs.get("project_pk")
        qs = Task.objects.filter(project_id=project_id, deleted_at__isnull=True)

        status = self.request.query_params.get("status")
        assignee = self.request.query_params.get("assignee")
        label = self.request.query_params.get("label")
        due_before = self.request.query_params.get("due_before")

        if status:
            qs = qs.filter(status=status)
        if assignee:
            qs = qs.filter(assignees__user__id=assignee)
        if label:
            qs = qs.filter(task_labels__label__id=label)
        if due_before:
            qs = qs.filter(due_date__lte=due_before)
        return qs.distinct()

    def perform_create(self, serializer):
        serializer.save(
            project_id=self.kwargs["project_pk"],
            creator=self.request.user
        )


# --- Subtasks ---
class SubtaskViewSet(viewsets.ModelViewSet):
    serializer_class = SubtaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]

    def get_queryset(self):
        return Subtask.objects.filter(task_id=self.kwargs["task_pk"])

    def perform_create(self, serializer):
        serializer.save(task_id=self.kwargs["task_pk"])


# --- Comments ---
class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]

    def get_queryset(self):
        return Comment.objects.filter(task_id=self.kwargs["task_pk"])

    def perform_create(self, serializer):
        serializer.save(task_id=self.kwargs["task_pk"], author=self.request.user)


# --- Attachments ---
class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]

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
