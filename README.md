# NEXA — Employee Management Dashboard

A stylish full-stack employee management application designed as a starting point for a DevOps portfolio project.

## Stack

- Frontend: React + Vite
- Backend: Flask REST API
- Database: MySQL
- UI: Custom responsive CSS
- Icons: Lucide React

## Features

- Dashboard with workforce statistics
- Employee CRUD
- Search and department filtering
- Performance visualization
- Analytics page
- Dark/light mode
- Responsive layout
- Health-check endpoint

## 1. Database

Create the database and sample data:

```sql
SOURCE database/schema.sql;
```

Or paste the contents of `database/schema.sql` into MySQL Workbench.

## 2. Backend

```bash
cd backend
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Install:

```bash
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set your MySQL password.

Run:

```bash
python app.py
```

API:

- http://localhost:5000/
- http://localhost:5000/api/health
- http://localhost:5000/api/employees

## 3. Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite, normally:

http://localhost:5173

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/employees` | List employees |
| GET | `/api/employees/:id` | Get one employee |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/health` | Health check |


SOURCE C:/Users/gowda/Downloads/nexa-dashboard-complete/nexa-dashboard/database/schema.sql


## Next DevOps stages

After this application works locally:

1. Git/GitHub
2. Docker
3. Docker Compose
4. Nginx
5. CI/CD
6. AWS
7. Terraform
8. Kubernetes
9. Helm
10. Prometheus/Grafana
 111
 12