from django.db import models
from django.conf import settings


class Profile(models.Model):
    """User profile (1:1 extension of AppUser)"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    phone = models.CharField(max_length=32, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)  # ✅ stores uploaded image
    timezone = models.CharField(max_length=64, default="UTC", blank=True)

    class Meta:
        verbose_name_plural = "Profiles"

    def __str__(self):
        return f"Profile({self.user.username})"

    @property
    def avatar_url(self):
        """Return full avatar URL or empty string"""
        if self.avatar:
            return self.avatar.url
        return ""