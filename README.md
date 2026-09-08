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

# Kubernetes & Cloud-Native Extension

The NEXA Dashboard was further extended from the AWS EC2 Docker Compose deployment to a Kubernetes-based deployment on Amazon EKS.

Additional technologies implemented:

* Kubernetes
* Amazon EKS
* Kubernetes Deployments
* Kubernetes Services
* Kubernetes Secrets
* Kubernetes Ingress
* AWS Application Load Balancer
* Horizontal Pod Autoscaler
* Helm
* Prometheus
* Grafana
* Alertmanager
* kube-state-metrics
* node-exporter

## EKS Deployment Flow

```text
Developer
    │
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── Build Docker Images
    ├── Push Images to Docker Hub
    ├── Configure AWS Credentials
    ├── Connect to Amazon EKS
    └── Update Kubernetes Deployments
            │
            ▼
        Amazon EKS
            │
      ┌─────┼─────┐
      ▼     ▼     ▼
 Frontend Backend MySQL
    Pods    Pods    Pod
      │      │
      └──┬───┘
         ▼
     AWS ALB
         │
         ▼
       User
```

## EKS Environment

```text
AWS Region:          ap-south-1
EKS Cluster:         nexa-eks
Application Namespace: nexa
Monitoring Namespace:  monitoring
```

## Kubernetes Features

The application uses:

* Kubernetes Deployments for application workloads
* Kubernetes Services for internal communication
* Kubernetes Secrets for sensitive configuration
* AWS ALB Ingress for external access
* HPA for automatic pod scaling
* Rolling updates for application deployments
* Kubernetes rollback capabilities

Frontend and backend workloads are configured with:

```text
Minimum replicas: 2
Maximum replicas: 5
CPU target: 70%
```

## Monitoring

The EKS environment is monitored using the `kube-prometheus-stack` Helm chart.

Monitoring components include:

* Prometheus
* Grafana
* Alertmanager
* Prometheus Operator
* kube-state-metrics
* node-exporter

A custom Grafana dashboard named **NEXA EKS Monitoring** provides visibility into:

* EKS node CPU usage
* EKS node memory usage
* NEXA pod CPU usage
* NEXA pod memory usage
* Pod health
* Pod restarts
* Running pods
* Desired replicas
* Current replicas

## CI/CD Deployment

The GitHub Actions pipeline was extended to deploy directly to Amazon EKS.

```text
Git Push
   ↓
GitHub Actions
   ↓
Docker Build
   ↓
Docker Hub
   ↓
AWS EKS
   ↓
Kubernetes Rolling Update
   ↓
New Application Version
```

Docker images are tagged using the Git commit SHA to provide deployment traceability.

Example:

```text
rahulgowda526/nexa-backend:<commit-sha>
rahulgowda526/nexa-frontend:<commit-sha>
```

This provides the following traceability:

```text
Git Commit
    ↓
Docker Image
    ↓
Kubernetes Deployment
    ↓
Running Pod
```

## Final DevOps Architecture

The completed NEXA project demonstrates two deployment approaches:

### AWS EC2 Deployment

```text
GitHub
   ↓
GitHub Actions
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

### AWS EKS Deployment

```text
GitHub
   ↓
GitHub Actions
   ↓
Docker Hub
   ↓
AWS EKS
   ↓
Kubernetes
   ↓
AWS ALB
   ↓
NEXA Dashboard

Prometheus
   ↓
Grafana
   ↓
Monitoring
```

## Important Infrastructure Note

Terraform was **not used to provision the NEXA EKS environment**.

Terraform was used separately to practice Infrastructure as Code by provisioning a **single AWS EC2 instance**.

Therefore:

```text
Terraform
   ↓
Separate Single EC2 Project
```

while:

```text
NEXA
   ↓
AWS EKS
   ↓
Kubernetes + Helm + GitHub Actions
   ↓
Prometheus + Grafana
```

## Project Outcome

NEXA evolved from a local full-stack application into an end-to-end Cloud and DevOps project covering:

```text
Application Development
        ↓
Docker
        ↓
Docker Compose
        ↓
Nginx
        ↓
Docker Hub
        ↓
AWS EC2
        ↓
GitHub Actions CI/CD
        ↓
Kubernetes
        ↓
AWS EKS
        ↓
Helm
        ↓
AWS ALB
        ↓
HPA
        ↓
Prometheus
        ↓
Grafana
```

The project demonstrates practical experience with containerization, cloud deployment, CI/CD, Kubernetes orchestration, autoscaling, monitoring, troubleshooting, and production-oriented DevOps practices.
