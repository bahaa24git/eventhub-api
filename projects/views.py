from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
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


class IsProjectMember(permissions.BasePermission):
    """Allow access only to members of the project."""
    def has_object_permission(self, request, view, obj):
        project = getattr(obj, "project", None)
        if project:
            return ProjectMember.objects.filter(project=project, user=request.user).exists()
        return False


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        project = serializer.save(created_by=self.request.user)
        ProjectMember.objects.create(
            project=project, user=self.request.user, role=ProjectMember.Role.OWNER
        )


class ProjectMemberViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]

    def get_queryset(self):
        return ProjectMember.objects.filter(project_id=self.kwargs["project_pk"])


class LabelViewSet(viewsets.ModelViewSet):
    serializer_class = LabelSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]

    def get_queryset(self):
        return Label.objects.filter(project_id=self.kwargs["project_pk"])

    def perform_create(self, serializer):
        project_id = self.kwargs["project_pk"]
        serializer.save(project_id=project_id)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["priority", "due_date"]

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
        return qs

    def perform_create(self, serializer):
        project_id = self.kwargs["project_pk"]
        serializer.save(project_id=project_id, creator=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]

    def get_queryset(self):
        return Comment.objects.filter(task_id=self.kwargs["task_pk"])

    def perform_create(self, serializer):
        task_id = self.kwargs["task_pk"]
        serializer.save(task_id=task_id, author=self.request.user)


class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]

    def get_queryset(self):
        return Attachment.objects.filter(task_id=self.kwargs["task_pk"])

    def perform_create(self, serializer):
        task_id = self.kwargs["task_pk"]
        file_obj = self.request.FILES.get("file")
        serializer.save(
            task_id=task_id,
            uploader=self.request.user,
            filename=file_obj.name if file_obj else "",
            size=file_obj.size if file_obj else 0,
        )
