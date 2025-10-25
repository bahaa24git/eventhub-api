# EventHub – Projects & Tasks API (Django + DRF)

A backend API for **project collaboration**: Projects, Members (roles), Tasks with status/priority, Labels, Comments, Attachments, and Subtasks.  
JWT authentication, search/filtering, pagination, and OpenAPI docs included.

---

## 🚀 Status

- Week 1: ✅ Repo + project skeleton  
- Week 2: ✅ Models, Migrations, Admin setup  
- Week 3: ✅ CRUD endpoints (Projects, Tasks, Labels)  
- Week 4: ✅ Auth + Members + Attachments + Comments  
- Week 5: 🚧 UI polish / Docs / Final review

---

## 🧠 Features (MVP)

- 🔐 **JWT Auth** (Login, Refresh) — Access token lifetime: **30 minutes**
- 👤 **Profile** (phone, timezone, avatar URL) for authenticated user
- 📁 **Projects CRUD** (+ archive flag)
- 👥 **Members** with roles: Owner / Admin / Member / Viewer
- 🧾 **Tasks** (CRUD) with status, priority, due date, soft-delete
- ✅ **Subtasks**, 💬 **Comments**, 📎 **Attachments**
- 🏷️ **Labels** (project-scoped, unique by name)
- 🔎 **Search / Filtering / Ordering** for tasks
- 📄 **OpenAPI/Swagger** with drf-spectacular
- 🌍 CORS, pagination, clean error responses

---

## 🧰 Tech Stack

- Django 5
- Django REST Framework
- SimpleJWT (JWT)
- drf-spectacular (OpenAPI/Swagger)
- django-cors-headers
- python-dotenv
- dj-database-url, WhiteNoise

---

## ⚡ Quickstart

```bash
# 1) Create venv & install deps
python -m venv .venv
# Windows
. .venv/Scripts/activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt

# 2) Environment
# Create .env in repo root:
# DEBUG=True
# SECRET_KEY=dev-secret-change
# DATABASE_URL=sqlite:///db.sqlite3
# ALLOWED_HOSTS=localhost,127.0.0.1

# 3) Migrate & run
python manage.py migrate
# (optional) create admin
python manage.py createsuperuser

python manage.py runserver

Media Files (Attachments)

During development, Django serves uploaded media (task attachments) directly (safe for ALX review):

# config/settings.py
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# config/urls.py
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... your routes (admin, api, docs, etc.)
]

if settings.DEBUG:  # development only
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

Now uploaded files will be accessible at URLs like:

http://127.0.0.1:8000/media/attachments/2025/10/24/your_file.jpg

> Production note: In production, serve media via Nginx or cloud storage (e.g., AWS S3). Django should not serve media in production.




---

🔑 Authentication

POST /api/v1/auth/login/ → { access, refresh }

POST /api/v1/auth/refresh/ → new access token

GET /api/v1/auth/me/ → current user

GET/PUT/PATCH /api/v1/auth/profile/ → update your profile (phone, timezone, avatar_url)

GET /api/v1/auth/users/ → list/search users (used for member search)


> Access tokens last 30 minutes (see SIMPLE_JWT in settings).




---

📚 API Highlights

Projects

GET /api/v1/projects/

POST /api/v1/projects/

GET/PUT/PATCH/DELETE /api/v1/projects/{id}/


Members

GET/POST /api/v1/projects/{project_pk}/members/

GET/PUT/PATCH/DELETE /api/v1/projects/{project_pk}/members/{id}/


Labels

GET/POST /api/v1/projects/{project_pk}/labels/

GET/PUT/PATCH/DELETE /api/v1/projects/{project_pk}/labels/{id}/


Tasks

GET/POST /api/v1/projects/{project_pk}/tasks/

GET/PUT/PATCH/DELETE /api/v1/projects/{project_pk}/tasks/{id}/

Filters: ?status=...&assignee=...&label=...&due_before=...

Search: ?search=...

Ordering: ?ordering=priority or -due_date


Subtasks

GET/POST /api/v1/projects/{project_pk}/tasks/{task_pk}/subtasks/


Comments

GET/POST /api/v1/projects/{project_pk}/tasks/{task_pk}/comments/


Attachments

GET/POST /api/v1/projects/{project_pk}/tasks/{task_pk}/attachments/



---

📘 API Docs

Swagger UI: /api/docs/

OpenAPI JSON: /api/schema/



---

🗂 Project Layout

config/               # Django project (settings/urls/asgi/wsgi)
projects/             # Projects, Members, Tasks, Labels, Attachments, Comments
accounts/             # Profile model + endpoints
users/                # Auth helpers / user listing (if used)
frontend/             # React app (optional, if included)
media/                # Uploaded files (created at runtime)
requirements.txt
manage.py
README.md


---

🧪 Notes for Reviewers (ALX)

Attachments are served via /media/... in DEBUG mode (dev-only).

CORS is enabled for http://localhost:3000.

JWT access token lifetime is 30 minutes for smoother testing.

Frontend stores tokens in localStorage and calls the API with Authorization: Bearer <token>.



---

🛣️ Roadmap

UI/UX final polish (cards, toasts, role colors)

Task board view (optional)

Production media via S3 (optional)

Tests (pytest + DRF test client)



---

📄 License

MIT — see LICENSE.

---
