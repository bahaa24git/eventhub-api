from rest_framework import serializers
from .models import ActivityLog
from django.contrib.auth import get_user_model

User = get_user_model()


class ActivityLogSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            "id",
            "project",
            "user",
            "action",
            "object_type",
            "object_id",
            "description",
            "timestamp",
        ]

    def get_user(self, obj):
        if not obj.user:
            return None
        return {"id": obj.user.id, "username": obj.user.username, "email": obj.user.email}