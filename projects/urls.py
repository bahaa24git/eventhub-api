from django.urls import path, include
from rest_framework_nested import routers

from .views import (
    ProjectViewSet, ProjectMemberViewSet, LabelViewSet,
    TaskViewSet, SubtaskViewSet, CommentViewSet, AttachmentViewSet
)
from events.views import ActivityLogViewSet  # 👈 import the ActivityLog viewset
from .views import project_report

# Base router
router = routers.DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='projects')


# Nested routers (for projects)
projects_router = routers.NestedDefaultRouter(router, r'projects', lookup='project')
projects_router.register(r'members', ProjectMemberViewSet, basename='project-members')
projects_router.register(r'labels', LabelViewSet, basename='project-labels')
projects_router.register(r'tasks', TaskViewSet, basename='project-tasks')

# ✅ New: register activity logs under each project
projects_router.register(r'activity', ActivityLogViewSet, basename='project-activity')


# Nested routers (for tasks)
tasks_router = routers.NestedDefaultRouter(projects_router, r'tasks', lookup='task')
tasks_router.register(r'subtasks', SubtaskViewSet, basename='task-subtasks')
tasks_router.register(r'comments', CommentViewSet, basename='task-comments')
tasks_router.register(r'attachments', AttachmentViewSet, basename='task-attachments')


urlpatterns = [
    path('', include(router.urls)),
    path('', include(projects_router.urls)),
    path('', include(tasks_router.urls)),
    path("projects/<uuid:pk>/report/", project_report, name="project-report"),
]
