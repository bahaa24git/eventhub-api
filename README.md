# EventHub API (Django + DRF)

A backend Event Management API for creating, updating, deleting, and viewing **upcoming events** with auth, capacity rules, filters, and pagination.

---

## 🚀 Status

- Week 1: ✅ Repo + project skeleton  
- Week 2: ✅ Models, Migrations, Admin setup  
- Week 3: ✅ CRUD endpoints (Projects, Tasks, Labels)  
- Week 4: ✅ Authentication + Members + Attachments + Comments  
- Week 5: 🚧 Testing + Documentation + Final polish  

---

## 🧠 Features (MVP)

- 🔐 **JWT Auth** (Register, Login, Refresh)
- 🧩 **Projects CRUD**
- 👥 **Members** with role-based access (Owner, Admin, Member, Viewer)
- 🏷️ **Labels** for project tasks
- 📋 **Tasks CRUD** with status, priority, and due dates
- ✅ **Subtasks, Comments, and Attachments**
- 🗑️ Soft Delete for Tasks
- ⚙️ Filtering, Search, and Ordering for Tasks
- 📄 Auto-generated API Docs with **drf-spectacular**
- 🌍 CORS + Pagination + Clean error handling

---

## 🧰 Tech Stack

- Django 5  
- Django REST Framework  
- drf-spectacular (OpenAPI / Swagger)  
- django-cors-headers  
- python-dotenv  
---

## ⚡ Quickstart

Clone and set up your local environment:

```bash
python -m venv .venv
# Windows: . .venv/Scripts/activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Create `.env` in the project root:
```
DEBUG=True
SECRET_KEY=dev-secret-change
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
```

Useful URLs (dev):
- Swagger UI: `/api/docs/`
- OpenAPI JSON: `/api/schema/`
- Health check: `/health/`
- Admin: `/admin/` (optional `python manage.py createsuperuser`)

## Project layout
```
config/           # Django project (settings/urls/asgi/wsgi)
events/           # app: events (Week 2: models/serializers/views)
users/            # app: users  (auth/permissions later)
docs/             # extra docs (optional)
requirements.txt
manage.py
README.md
LICENSE
```

## Roadmap (5 weeks)
- **W1:** Plan + skeleton (this repo)
- **W2:** Events CRUD + ownership + validations
- **W3:** Auth (JWT optional) + upcoming list + pagination/filters
- **W4:** Capacity & (optional) waitlist + docs
- **W5:** Deploy (PythonAnywhere) + demo video

## License
MIT — see `LICENSE`.

# eventhub-api