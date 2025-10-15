from rest_framework_nested import routers
from .views import (
    ProjectViewSet, ProjectMemberViewSet, LabelViewSet,
    TaskViewSet, CommentViewSet, AttachmentViewSet
)

router = routers.SimpleRouter()
router.register(r'projects', ProjectViewSet, basename='projects')

projects_router = routers.NestedSimpleRouter(router, r'projects', lookup='project')
projects_router.register(r'members', ProjectMemberViewSet, basename='project-members')
projects_router.register(r'labels', LabelViewSet, basename='project-labels')
projects_router.register(r'tasks', TaskViewSet, basename='project-tasks')

tasks_router = routers.NestedSimpleRouter(projects_router, r'tasks', lookup='task')
tasks_router.register(r'comments', CommentViewSet, basename='task-comments')
tasks_router.register(r'attachments', AttachmentViewSet, basename='task-attachments')

urlpatterns = router.urls + projects_router.urls + tasks_router.urls
