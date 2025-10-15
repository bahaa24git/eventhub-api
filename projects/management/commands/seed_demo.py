from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from projects.models import (
    Project, ProjectMember, Label, Task, Subtask, Comment
)
from django.utils import timezone
import random


class Command(BaseCommand):
    help = "Seeds demo data for testing API (projects, tasks, comments, etc.)"

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Seeding demo data..."))

        # Clear existing data
        Comment.objects.all().delete()
        Subtask.objects.all().delete()
        Task.objects.all().delete()
        Label.objects.all().delete()
        ProjectMember.objects.all().delete()
        Project.objects.all().delete()
        User.objects.all().exclude(is_superuser=True).delete()

        # Create demo users
        users = []
        for i in range(3):
            user = User.objects.create_user(
                username=f"user{i+1}",
                email=f"user{i+1}@example.com",
                password="password123"
            )
            users.append(user)

        # Create a project
        project = Project.objects.create(
            name="Demo Project",
            description="A test project with tasks and members.",
            created_by=users[0],
        )

        # Add members
        ProjectMember.objects.create(project=project, user=users[0], role="OWNER")
        ProjectMember.objects.create(project=project, user=users[1], role="ADMIN")
        ProjectMember.objects.create(project=project, user=users[2], role="MEMBER")

        # Add labels
        bug = Label.objects.create(project=project, name="Bug", color_hex="#FF5555")
        feature = Label.objects.create(project=project, name="Feature", color_hex="#55FF55")

        # Create tasks
        for i in range(5):
            task = Task.objects.create(
                project=project,
                creator=random.choice(users),
                title=f"Task {i+1}",
                description="A demo task.",
                status=random.choice(["TODO", "IN_PROGRESS", "DONE"]),
                priority=random.choice(["LOW", "MEDIUM", "HIGH"]),
                due_date=timezone.now().date(),
            )

            # Add subtasks
            for j in range(2):
                Subtask.objects.create(task=task, title=f"Subtask {i+1}.{j+1}")

            # Add comments
            Comment.objects.create(task=task, author=random.choice(users), body="This is a sample comment.")

        self.stdout.write(self.style.SUCCESS("✅ Demo data created successfully!"))
