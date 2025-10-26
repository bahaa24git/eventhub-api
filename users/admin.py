from django.contrib import admin
from .models import AppUser

@admin.register(AppUser)
class AppUserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "phone")
    search_fields = ("username", "email", "phone")