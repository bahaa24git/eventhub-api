from rest_framework import permissions
from .models import ProjectMember, Project


class IsProjectMember(permissions.BasePermission):
    """
    Base: user must belong to the project.
    """

    def has_permission(self, request, view):
        project_id = view.kwargs.get("project_pk") or view.kwargs.get("pk")
        if not project_id:
            return False
        return ProjectMember.objects.filter(
            project_id=project_id, user=request.user
        ).exists()


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Only OWNER or ADMIN of the project can perform write actions.
    """

    def has_permission(self, request, view):
        project_id = view.kwargs.get("project_pk") or view.kwargs.get("pk")
        if not project_id:
            return False
        membership = ProjectMember.objects.filter(
            project_id=project_id, user=request.user
        ).first()
        if not membership:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return membership.role in ["OWNER", "ADMIN"]


class IsTaskAssigneeOrAdmin(permissions.BasePermission):
    """
    Members can edit their own tasks.
    Admins/Owners can edit all.
    """

    def has_object_permission(self, request, view, obj):
        # Anyone in the project can read
        if request.method in permissions.SAFE_METHODS:
            return True

        # Admins/owners always allowed
        membership = ProjectMember.objects.filter(
            project=obj.project, user=request.user
        ).first()
        if not membership:
            return False
        if membership.role in ["OWNER", "ADMIN"]:
            return True

        # For non-admins: allow edit only if user is assignee or creator
        return obj.creator == request.user or obj.assignees.filter(user=request.user).exists()

class IsNotViewer(permissions.BasePermission):
    def has_permission(self, request, view):
        project_id = view.kwargs.get("project_pk")
        if request.method in permissions.SAFE_METHODS:
            return True
        member = ProjectMember.objects.filter(project_id=project_id, user=request.user).first()
        return member and member.role != "VIEWER"