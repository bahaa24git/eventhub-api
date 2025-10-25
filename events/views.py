from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import ActivityLog
from .serializers import ActivityLogSerializer
from projects.models import Project
from projects.permissions import IsProjectMember


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Returns all activity logs for a given project.
    Accessible by project members only.
    """
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]

    def get_queryset(self):
        project_id = self.kwargs.get("project_pk")
        return ActivityLog.objects.filter(project_id=project_id).order_by("-timestamp")

    @action(detail=False, methods=["get"], url_path="recent")
    def recent(self, request, project_pk=None):
        logs = self.get_queryset()[:10]
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)