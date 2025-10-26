from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import (
    Project, ProjectMember, Label, Task, Subtask,
    TaskAssignee, TaskLabel, Comment, Attachment
)

User = get_user_model()

# --- User ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "phone"]

# --- Project Member ---
class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ProjectMember
        fields = ["id", "user", "role", "joined_at"]
        read_only_fields = ["id", "joined_at"]

# --- Label ---
class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = ["id", "name", "color_hex"]

# --- Task Assignee ---
class TaskAssigneeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TaskAssignee
        fields = ["id", "user", "assigned_at"]

# --- Comment ---
class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "body", "author", "created_at", "edited_at"]

# --- Attachment ---
class AttachmentSerializer(serializers.ModelSerializer):
    uploader = UserSerializer(read_only=True)

    class Meta:
        model = Attachment
        fields = [
            "id", "filename", "file", "content_type",
            "size", "uploader", "created_at"
        ]

# --- Subtask ---
class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = ["id", "title", "is_done", "created_at"]

# --- Task ---
class TaskSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    assignees = TaskAssigneeSerializer(many=True, read_only=True)
    labels = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    subtasks = SubtaskSerializer(many=True, read_only=True)

    # ✅ write-only IDs (frontend sends these)
    assignee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    label_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )

    # project is injected by the view
    project = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Task
        fields = [
            "id", "project", "creator", "title", "description",
            "status", "priority", "due_date",
            "assignees", "assignee_ids",
            "labels", "label_ids",
            "subtasks", "comments",
            "created_at", "updated_at", "deleted_at"
        ]
        read_only_fields = ("project", "creator", "created_at", "updated_at", "deleted_at")

    # --- labels getter (for output) ---
    def get_labels(self, obj):
        return LabelSerializer(
            [tl.label for tl in obj.task_labels.all()],
            many=True
        ).data

    # --- helper: assign users ---
    def _set_assignees(self, task, ids):
        TaskAssignee.objects.filter(task=task).delete()
        if not ids:
            return
        users = User.objects.filter(id__in=ids)
        TaskAssignee.objects.bulk_create(
            [TaskAssignee(task=task, user=u) for u in users]
        )

    # --- helper: assign labels ---
    def _set_labels(self, task, label_ids):
        TaskLabel.objects.filter(task=task).exclude(label_id__in=label_ids).delete()
        if not label_ids:
            return
        labels = Label.objects.filter(id__in=label_ids)
        for label in labels:
            TaskLabel.objects.get_or_create(task=task, label=label)

    # --- create ---
    def create(self, validated_data):
        assignee_ids = validated_data.pop("assignee_ids", [])
        label_ids = validated_data.pop("label_ids", [])
        task = super().create(validated_data)
        self._set_assignees(task, assignee_ids)
        self._set_labels(task, label_ids)
        return task

    # --- update ---
    def update(self, instance, validated_data):
        assignee_ids = validated_data.pop("assignee_ids", None)
        label_ids = validated_data.pop("label_ids", None)
        task = super().update(instance, validated_data)
        if assignee_ids is not None:
            self._set_assignees(task, assignee_ids)
        if label_ids is not None:
            self._set_labels(task, label_ids)
        return task

# --- Project ---
class ProjectSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)  # ✅ now nested user info
    members = ProjectMemberSerializer(many=True, read_only=True)
    labels = LabelSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id", "name", "description", "is_archived",
            "created_by", "created_at", "updated_at",
            "members", "labels"
        ]

# --- Dashboard ---
class ProjectDashboardSerializer(serializers.Serializer):
    project_id = serializers.UUIDField()
    project_name = serializers.CharField()
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    pending_tasks = serializers.IntegerField()
    total_subtasks = serializers.IntegerField()
    completed_subtasks = serializers.IntegerField()
    members_count = serializers.IntegerField()
    labels_count = serializers.IntegerField()
    comments_count = serializers.IntegerField()
    attachments_count = serializers.IntegerField()
    last_activity = serializers.DateTimeField(allow_null=True)
    overdue_tasks = serializers.IntegerField()

    def get_overdue_tasks(self, obj):
        today = timezone.now().date()
        return Task.objects.filter(
            project=obj["project_id"],
            due_date__lt=today,
            status__in=["TODO", "IN_PROGRESS", "BLOCKED"]
        ).count()