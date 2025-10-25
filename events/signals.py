from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone

from projects.models import (
    Project,
    ProjectMember,
    Task,
    Subtask,
    Comment,
    Attachment,
)
from .models import ActivityLog


print("✅ events.signals imported — all signals registered!")


# --------------------------------------------------------------------
# 🔹 Helper: extract related user if available
# --------------------------------------------------------------------
def get_user_from_instance(instance):
    """
    Safely get the most relevant user from an instance.
    Looks for _actor, creator, author, uploader, etc.
    """
    return (
        getattr(instance, "_actor", None)
        or getattr(instance, "creator", None)
        or getattr(instance, "created_by", None)
        or getattr(instance, "author", None)
        or getattr(instance, "uploader", None)
        or getattr(instance, "user", None)
    )


# --------------------------------------------------------------------
# 🧩 PROJECT Activity
# --------------------------------------------------------------------
@receiver(post_save, sender=Project)
def log_project_activity(sender, instance, created, **kwargs):
    action = "CREATE" if created else "UPDATE"
    user = get_user_from_instance(instance)

    print(f"🔥 Project signal fired for {instance.name}, action={action}")

    ActivityLog.objects.create(
        project=instance,
        user=user,
        action=action,
        object_type="Project",
        object_id=str(instance.id),
        description=f"Project '{instance.name}' was {action.lower()}d.",
        timestamp=timezone.now(),
    )


@receiver(post_delete, sender=Project)
def log_project_deletion(sender, instance, **kwargs):
    user = get_user_from_instance(instance)
    ActivityLog.objects.create(
        project=instance,
        user=user,
        action="DELETE",
        object_type="Project",
        object_id=str(instance.id),
        description=f"Project '{instance.name}' was deleted.",
        timestamp=timezone.now(),
    )


# --------------------------------------------------------------------
# 🧩 PROJECT MEMBERS Activity
# --------------------------------------------------------------------
@receiver(post_save, sender=ProjectMember)
def log_member_added(sender, instance, created, **kwargs):
    if created:
        ActivityLog.objects.create(
            project=instance.project,
            user=get_user_from_instance(instance),
            action="CREATE",
            object_type="ProjectMember",
            object_id=str(instance.id),
            description=f"User '{instance.user.username}' was added to the project as {instance.role}.",
            timestamp=timezone.now(),
        )
    else:
        ActivityLog.objects.create(
            project=instance.project,
            user=get_user_from_instance(instance),
            action="UPDATE",
            object_type="ProjectMember",
            object_id=str(instance.id),
            description=f"User '{instance.user.username}' role was changed to {instance.role}.",
            timestamp=timezone.now(),
        )


@receiver(post_delete, sender=ProjectMember)
def log_member_removed(sender, instance, **kwargs):
    ActivityLog.objects.create(
        project=instance.project,
        user=get_user_from_instance(instance),
        action="DELETE",
        object_type="ProjectMember",
        object_id=str(instance.id),
        description=f"User '{instance.user.username}' was removed from the project.",
        timestamp=timezone.now(),
    )


# --------------------------------------------------------------------
# 🧩 TASK Activity
# --------------------------------------------------------------------
@receiver(post_save, sender=Task)
def log_task_activity(sender, instance, created, **kwargs):
    action = "CREATE" if created else "UPDATE"
    ActivityLog.objects.create(
        project=instance.project,
        user=get_user_from_instance(instance),
        action=action,
        object_type="Task",
        object_id=str(instance.id),
        description=f"Task '{instance.title}' was {action.lower()}d.",
        timestamp=timezone.now(),
    )


@receiver(post_delete, sender=Task)
def log_task_deletion(sender, instance, **kwargs):
    ActivityLog.objects.create(
        project=instance.project,
        user=get_user_from_instance(instance),
        action="DELETE",
        object_type="Task",
        object_id=str(instance.id),
        description=f"Task '{instance.title}' was deleted.",
        timestamp=timezone.now(),
    )


# --------------------------------------------------------------------
# 🧩 SUBTASK Activity
# --------------------------------------------------------------------
@receiver(post_save, sender=Subtask)
def log_subtask_activity(sender, instance, created, **kwargs):
    action = "CREATE" if created else "UPDATE"
    ActivityLog.objects.create(
        project=instance.task.project,
        user=get_user_from_instance(instance),
        action=action,
        object_type="Subtask",
        object_id=str(instance.id),
        description=f"Subtask '{instance.title}' was {action.lower()}d.",
        timestamp=timezone.now(),
    )


@receiver(post_delete, sender=Subtask)
def log_subtask_deletion(sender, instance, **kwargs):
    ActivityLog.objects.create(
        project=instance.task.project,
        user=get_user_from_instance(instance),
        action="DELETE",
        object_type="Subtask",
        object_id=str(instance.id),
        description=f"Subtask '{instance.title}' was deleted.",
        timestamp=timezone.now(),
    )


# --------------------------------------------------------------------
# 🧩 COMMENT Activity
# --------------------------------------------------------------------
@receiver(post_save, sender=Comment)
def log_comment_activity(sender, instance, created, **kwargs):
    if created:
        user = get_user_from_instance(instance)
        ActivityLog.objects.create(
            project=instance.task.project,
            user=user,
            action="COMMENT",
            object_type="Comment",
            object_id=str(instance.id),
            description=f"{user.username if user else 'Someone'} commented on task '{instance.task.title}'.",
            timestamp=timezone.now(),
        )


# --------------------------------------------------------------------
# 🧩 ATTACHMENT Activity
# --------------------------------------------------------------------
@receiver(post_save, sender=Attachment)
def log_attachment_activity(sender, instance, created, **kwargs):
    if created:
        user = get_user_from_instance(instance)
        ActivityLog.objects.create(
            project=instance.task.project,
            user=user,
            action="UPLOAD",
            object_type="Attachment",
            object_id=str(instance.id),
            description=f"{user.username if user else 'Someone'} uploaded '{instance.filename}'.",
            timestamp=timezone.now(),
        )