from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Project, ProjectMember, Label, Task, Subtask,
    TaskAssignee, TaskLabel, Comment, Attachment
)

User = get_user_model()


# --- User ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


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

    class Meta:
        model = Task
        fields = [
            "id", "project", "creator", "title", "description",
            "status", "priority", "due_date",
            "assignees", "labels", "subtasks", "comments",
            "created_at", "updated_at", "deleted_at"
        ]

    def get_labels(self, obj):
        # Fetch related labels through TaskLabel relationship
        return LabelSerializer(
            [tl.label for tl in obj.task_labels.all()], many=True
        ).data


# --- Project ---
class ProjectSerializer(serializers.ModelSerializer):
    members = ProjectMemberSerializer(many=True, read_only=True)
    labels = LabelSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id", "name", "description", "is_archived",
            "created_by", "created_at", "updated_at",
            "members", "labels"
        ]
