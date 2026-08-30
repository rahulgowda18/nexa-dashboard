# NEXA — Employee Management Dashboard

A stylish full-stack employee management application built with React, Flask, and MySQL, extended into a DevOps portfolio project with Docker, Docker Compose, Nginx, Docker Hub, GitHub Actions, and AWS EC2.

## Stack

* Frontend: React + Vite
* Backend: Flask REST API
* Database: MySQL
* UI: Custom responsive CSS
* Icons: Lucide React
* Containerization: Docker
* Orchestration: Docker Compose
* Reverse Proxy: Nginx
* Container Registry: Docker Hub
* CI/CD: GitHub Actions
* Cloud: AWS EC2
* OS: Ubuntu Linux

## Features

* Dashboard with workforce statistics
* Employee CRUD
* Search and department filtering
* Performance visualization
* Analytics page
* Dark/light mode
* Responsive layout
* Health-check endpoint
* Dockerized frontend and backend
* MySQL database container
* Nginx reverse proxy
* Automated CI/CD deployment
* AWS EC2 deployment

## Project Structure

```text
nexa-dashboard/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
│
├── database/
│   └── schema.sql
│
├── nginx/
│   └── default.conf
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
├── docker-compose.yml
└── README.md
```

# Local Development

## 1. Database

Create the database and sample data.

Using MySQL:

```sql
SOURCE database/schema.sql;
```

Or paste the contents of `database/schema.sql` into MySQL Workbench.

---

## 2. Backend

```bash
cd backend
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and configure your MySQL credentials.

Run the backend:

```bash
python app.py
```

API:

* `http://localhost:5000/`
* `http://localhost:5000/api/health`
* `http://localhost:5000/api/employees`

---

## 3. Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite, normally:

```text
http://localhost:5173
```

# API

| Method | Endpoint             | Purpose          |
| ------ | -------------------- | ---------------- |
| GET    | `/api/employees`     | List employees   |
| GET    | `/api/employees/:id` | Get one employee |
| POST   | `/api/employees`     | Create employee  |
| PUT    | `/api/employees/:id` | Update employee  |
| DELETE | `/api/employees/:id` | Delete employee  |
| GET    | `/api/health`        | Health check     |

## Health Check

The health endpoint verifies both the API and database connection.

```bash
curl http://localhost:5000/api/health
```

Example response:

```json
{
  "database": "connected",
  "status": "healthy"
}
```

# Docker

The application is containerized using Docker.

Build the application:

```bash
docker compose build
```

Start the containers:

```bash
docker compose up -d
```

Check running containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs
```

Stop the application:

```bash
docker compose down
```

## Docker Services

```text
nexa-frontend
nexa-backend
nexa-mysql
nexa-nginx
```

Architecture:

```text
Browser
   │
   ▼
 Nginx :80
   │
   ├── Frontend
   │
   └── Backend :5000
          │
          ▼
       MySQL :3306
```

# Docker Hub

The frontend and backend Docker images are published to Docker Hub.

Backend:

```text
rahulgowda526/nexa-backend:latest
```

Frontend:

```text
rahulgowda526/nexa-frontend:latest
```

Pull the latest images:

```bash
docker compose pull
```

Start the application:

```bash
docker compose up -d
```

# Nginx

Nginx is used as a reverse proxy.

```text
/api/*
    ↓
Flask Backend

/*
    ↓
React Frontend
```

Nginx exposes port:

```text
80
```

The backend and MySQL services are kept inside the Docker network.

# AWS Deployment

The application is deployed on an Ubuntu AWS EC2 instance.

Deployment flow:

```text
GitHub
   ↓
Docker Hub
   ↓
AWS EC2
   ↓
Docker Compose
   ↓
Nginx
   ↓
NEXA Dashboard
```

The application can be accessed through the EC2 public IP:

```text
http://<EC2-PUBLIC-IP>
```

# CI/CD

GitHub Actions is used to automate the deployment process.

Whenever code is pushed to the main branch:

```text
Developer
    │
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── Build Backend Image
    │
    ├── Build Frontend Image
    │
    ├── Login to Docker Hub
    │
    ├── Push Images
    │
    └── Deploy to AWS EC2
             │
             ▼
        Docker Compose
             │
             ▼
       Updated Application
```

## GitHub Actions Secrets

Sensitive deployment information is stored using GitHub Actions Secrets.

```text
DOCKER_USERNAME
DOCKERHUB_TOKEN
EC2_HOST
EC2_SSH_KEY
```

No passwords or private SSH keys are stored directly in the repository.

# CI/CD Verification

The CI/CD pipeline was tested by making a change to the application and pushing it to GitHub.

```text
Code Change
    ↓
git add .
    ↓
git commit
    ↓
git push
    ↓
GitHub Actions
    ↓
Docker Hub
    ↓
AWS EC2
    ↓
New Version Live
```

The updated version was successfully displayed on the live AWS deployment.

# Troubleshooting

During deployment, the following issues were encountered and resolved:

### MySQL Exit Code 137

MySQL restarted because the EC2 instance had limited memory.

The issue was investigated using:

```bash
free -h
docker ps
docker logs nexa-mysql
```

### Nginx 502 Bad Gateway

Nginx initially returned `502 Bad Gateway` for API requests.

The issue was caused by Nginx using an outdated backend container IP after the backend container was recreated.

Restarting Nginx refreshed the backend connection:

```bash
docker restart nexa-nginx
```

The API then worked correctly.

### Container-to-Container Testing

Backend connectivity was tested from the Nginx container:

```bash
docker exec nexa-nginx wget -qO- http://backend:5000
```

The backend returned:

```json
{
  "message": "NEXA API is running",
  "status": "ok"
}
```

The employee API was then successfully tested through Nginx:

```bash
curl http://localhost/api/employees
```

# DevOps Skills Practiced

* Git & GitHub
* Linux
* Docker
* Docker Compose
* Docker Hub
* Nginx
* AWS EC2
* GitHub Actions
* CI/CD
* SSH
* Container networking
* Application logs
* Troubleshooting
* REST API testing
* MySQL
* Cloud deployment

# Next DevOps Stages

After completing this project:

1. Terraform
2. AWS Infrastructure as Code
3. Kubernetes
4. Helm
5. Jenkins
6. Prometheus
7. Grafana
8. Advanced CI/CD
9. HTTPS / SSL
10. Production deployment practices
