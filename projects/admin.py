from django.contrib import admin
from .models import (
    Project, ProjectMember, Label, Task, Subtask,
    TaskAssignee, TaskLabel, Comment, Attachment, ActivityLog, Profile
)

admin.site.register(Project)
admin.site.register(ProjectMember)
admin.site.register(Label)
admin.site.register(Task)
admin.site.register(Subtask)
admin.site.register(TaskAssignee)
admin.site.register(TaskLabel)
admin.site.register(Comment)
admin.site.register(Attachment)
admin.site.register(ActivityLog)
admin.site.register(Profile)
