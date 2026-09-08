# NEXA Dashboard Deployment

This document describes the end-to-end deployment process for the NEXA Dashboard application, from source code management through containerization, CI/CD, Amazon EKS deployment, external access, and application verification.

---

## 1. Project Architecture

The NEXA Dashboard follows this deployment flow:

```text
Developer
    |
    | git push
    v
+----------------+
|    GitHub      |
| Source Code    |
+-------+--------+
        |
        | Push to main
        v
+----------------------+
|   GitHub Actions     |
|       CI/CD          |
+----------+-----------+
           |
           | Build & Push
           v
+----------------------+
|     Docker Hub       |
| Backend + Frontend   |
|       Images         |
+----------+-----------+
           |
           | Pull Images
           v
+----------------------------------+
|          AWS EKS Cluster         |
|                                  |
|  +------------+  +------------+  |
|  |  Frontend  |  |  Backend   |  |
|  |  React.js  |  |   Flask    |  |
|  +------------+  +-----+------+  |
|                         |         |
|                    +----v-----+   |
|                    |  MySQL   |   |
|                    +----------+   |
+------------------+---------------+
                   |
                   v
              AWS ALB
                   |
                   v
             NEXA Dashboard
```

### Application Components

The application consists of:

* **Frontend:** React.js
* **Backend:** Flask/Python
* **Database:** MySQL
* **Containerization:** Docker
* **Container Registry:** Docker Hub
* **Orchestration:** Kubernetes
* **Cloud Platform:** Amazon EKS
* **External Access:** AWS Application Load Balancer
* **CI/CD:** GitHub Actions
* **Monitoring:** Prometheus and Grafana
* **Autoscaling:** Kubernetes HPA

---

# 2. AWS Infrastructure

The application is deployed on **Amazon Elastic Kubernetes Service (EKS)** in the AWS `ap-south-1` region.

### EKS Cluster

```text
Cluster Name: nexa-eks
Region: ap-south-1
```

The Kubernetes cluster provides the platform for running the NEXA application workloads.

The application runs inside the Kubernetes namespace:

```bash
nexa
```

Monitoring components run separately in:

```bash
monitoring
```

### Main AWS Components

```text
AWS
 |
 +-- EKS Cluster
 |     |
 |     +-- Kubernetes Nodes
 |     +-- NEXA Workloads
 |     +-- Monitoring Stack
 |
 +-- Application Load Balancer
       |
       +-- NEXA Ingress
```

---

# 3. Docker Deployment

The frontend and backend applications are containerized using Docker.

### Backend Image

```text
rahulgowda526/nexa-backend
```

### Frontend Image

```text
rahulgowda526/nexa-frontend
```

The Docker images are stored in Docker Hub and pulled by Kubernetes during deployment.

### Image Tagging

The CI/CD pipeline publishes two tags:

```text
latest
<Git commit SHA>
```

Example:

```text
rahulgowda526/nexa-backend:<commit-sha>
rahulgowda526/nexa-frontend:<commit-sha>
```

Using the Git commit SHA provides an immutable reference to the source code version used for a deployment.

---

# 4. Kubernetes Deployment

The application is deployed using Kubernetes resources.

### Namespace

```bash
kubectl create namespace nexa
```

All NEXA application resources are deployed inside the `nexa` namespace.

### Application Workloads

The main Kubernetes deployments are:

```text
backend
frontend
mysql
```

Check deployments:

```bash
kubectl get deployments -n nexa
```

Example:

```text
NAME       READY   UP-TO-DATE   AVAILABLE
backend    2/2     2            2
frontend   2/2     2            2
mysql      1/1     1            1
```

### Pods

Check running pods:

```bash
kubectl get pods -n nexa
```

The backend and frontend run multiple replicas to provide availability.

MySQL runs as a separate database workload.

---

# 5. Kubernetes Services

Kubernetes Services provide communication between application components.

Check services:

```bash
kubectl get svc -n nexa
```

The main services are:

```text
backend
frontend
mysql
```

The backend communicates with MySQL using the Kubernetes service name rather than an external IP.

The frontend communicates with the backend through the Kubernetes application networking configuration.

---

# 6. Horizontal Pod Autoscaling

Horizontal Pod Autoscaling (HPA) is configured for the frontend and backend.

Check HPA:

```bash
kubectl get hpa -n nexa
```

Current configuration:

```text
Backend:
Minimum replicas: 2
Maximum replicas: 5
CPU target: 70%

Frontend:
Minimum replicas: 2
Maximum replicas: 5
CPU target: 70%
```

The HPA allows Kubernetes to automatically increase the number of application replicas when CPU utilization increases.

---

# 7. EKS Deployment

The application is deployed to Amazon EKS using Kubernetes manifests and container images stored in Docker Hub.

After configuring AWS credentials, the Kubernetes client can connect to the EKS cluster using:

```bash
aws eks update-kubeconfig \
  --region ap-south-1 \
  --name nexa-eks
```

Verify the connection:

```bash
kubectl get nodes
```

Then verify the NEXA workloads:

```bash
kubectl get pods -n nexa
```

```bash
kubectl get deployments -n nexa
```

---

# 8. CI/CD Deployment to EKS

GitHub Actions automates the application deployment process.

The pipeline is triggered when code is pushed to the `main` branch.

```text
Developer
    |
    v
git push
    |
    v
GitHub
    |
    v
GitHub Actions
    |
    +---- Build Backend Docker Image
    |
    +---- Build Frontend Docker Image
    |
    v
Docker Hub
    |
    v
Configure AWS Credentials
    |
    v
Connect to EKS
    |
    v
Update Kubernetes Images
    |
    v
Rolling Update
    |
    v
Verify Deployment
```

The pipeline updates the Kubernetes deployments using:

```bash
kubectl set image
```

The backend and frontend images are tagged using the GitHub commit SHA.

This provides traceability between:

```text
Git Commit
    ↓
Docker Image
    ↓
Kubernetes Deployment
```

---

# 9. Ingress / AWS Application Load Balancer

The NEXA application is exposed externally using Kubernetes Ingress and an AWS Application Load Balancer.

Check the ingress:

```bash
kubectl get ingress -n nexa
```

Example:

```text
NAME           CLASS   HOSTS   ADDRESS
nexa-ingress   alb     *       <AWS-ALB-DNS>
```

Traffic flow:

```text
Internet
    |
    v
AWS Application Load Balancer
    |
    v
NEXA Kubernetes Ingress
    |
    +-----------> Frontend Service
    |
    +-----------> Backend Service
```

The ALB provides the external entry point for the NEXA application.

The application can be accessed through the ALB DNS address.

---

# 10. Application Verification

After deployment, the application health is verified using Kubernetes commands.

### Check Pods

```bash
kubectl get pods -n nexa
```

All application pods should show:

```text
STATUS: Running
```

### Check Deployments

```bash
kubectl get deployments -n nexa
```

The desired and available replicas should match.

### Check Services

```bash
kubectl get svc -n nexa
```

Verify that the frontend, backend, and MySQL services exist.

### Check Ingress

```bash
kubectl get ingress -n nexa
```

Verify that the AWS ALB has an assigned address.

### Check HPA

```bash
kubectl get hpa -n nexa
```

Verify the configured minimum and maximum replicas.

### Check Backend Logs

```bash
kubectl logs deployment/backend -n nexa
```

### Check Frontend Logs

```bash
kubectl logs deployment/frontend -n nexa
```

### Check Rollout Status

```bash
kubectl rollout status deployment/backend -n nexa
```

```bash
kubectl rollout status deployment/frontend -n nexa
```

---

# 11. End-to-End Deployment Flow

The complete NEXA deployment process is:

```text
1. Developer modifies application
          |
          v
2. Code pushed to GitHub
          |
          v
3. GitHub Actions pipeline starts
          |
          v
4. Docker images are built
          |
          v
5. Images pushed to Docker Hub
          |
          v
6. AWS credentials configured
          |
          v
7. EKS kubeconfig configured
          |
          v
8. Kubernetes deployments updated
          |
          v
9. Rolling update performed
          |
          v
10. Pods become Ready
          |
          v
11. AWS ALB routes external traffic
          |
          v
12. NEXA Dashboard available to users
          |
          v
13. Prometheus collects cluster metrics
          |
          v
14. Grafana visualizes infrastructure
             and application health
```

---

# 12. Final Architecture Summary

The NEXA Dashboard demonstrates an end-to-end cloud-native DevOps deployment:

```text
GitHub
   |
   v
GitHub Actions
   |
   +--------------------+
   |                    |
   v                    v
Docker Hub          AWS EKS
                        |
                   Kubernetes
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
      Frontend       Backend        MySQL
          |             |
          +------+------+
                 |
                 v
             AWS ALB
                 |
                 v
          NEXA Dashboard

Monitoring:

AWS EKS
   |
   v
Prometheus
   |
   v
Grafana
   |
   v
NEXA EKS Monitoring
```

This architecture provides containerized application deployment, automated CI/CD, Kubernetes orchestration, external load balancing, autoscaling, and infrastructure monitoring.
