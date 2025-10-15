from rest_framework import serializers
from .models import (
    Project, ProjectMember, Label, Task, Subtask,
    TaskAssignee, TaskLabel, Comment, Attachment
)
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ProjectMember
        fields = ["id", "user", "role", "joined_at"]


class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = ["id", "name", "color_hex"]


class TaskAssigneeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TaskAssignee
        fields = ["id", "user", "assigned_at"]


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "body", "author", "created_at", "edited_at"]


class AttachmentSerializer(serializers.ModelSerializer):
    uploader = UserSerializer(read_only=True)

    class Meta:
        model = Attachment
        fields = [
            "id", "filename", "file", "content_type",
            "size", "uploader", "created_at"
        ]


class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = ["id", "title", "is_done", "created_at"]


class TaskSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    assignees = TaskAssigneeSerializer(many=True, read_only=True)
    labels = LabelSerializer(many=True, read_only=True, source="task_labels__label")
    comments = CommentSerializer(many=True, read_only=True)
    subtasks = SubtaskSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            "id", "project", "creator", "title", "description",
            "status", "priority", "due_date", "assignees",
            "labels", "subtasks", "comments",
            "created_at", "updated_at", "deleted_at"
        ]


class ProjectSerializer(serializers.ModelSerializer):
    members = ProjectMemberSerializer(many=True, read_only=True)
    labels = LabelSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ["id", "name", "description", "is_archived",
                  "created_by", "created_at", "updated_at", "members", "labels"]
