# NEXA Dashboard — Kubernetes Deployment

This document explains how the NEXA Dashboard is deployed and managed using Kubernetes on Amazon EKS.

The application runs in the `nexa` namespace and consists of frontend, backend, and MySQL workloads.

---

# 1. Kubernetes Architecture

```text
                    AWS EKS
                       |
                 Kubernetes Cluster
                       |
                 +-----+------+
                 |            |
              nexa        monitoring
                 |
        +--------+--------+
        |        |        |
        v        v        v
    Frontend  Backend   MySQL
       Pod       Pods     Pod
        |         |
        +----+----+
             |
          Services
             |
          Ingress
             |
            ALB
             |
          Internet
```

---

# 2. Namespace

A Kubernetes namespace provides logical isolation for resources inside a cluster.

NEXA application resources are deployed into:

```text
nexa
```

Monitoring resources are deployed separately into:

```text
monitoring
```

### Check namespaces

```bash
kubectl get namespaces
```

### Check NEXA resources

```bash
kubectl get all -n nexa
```

### Create the NEXA namespace

```bash
kubectl create namespace nexa
```

Using a separate namespace keeps the NEXA application resources organized and makes resource management easier.

---

# 3. Pods

A Pod is the smallest deployable unit in Kubernetes.

The NEXA application uses Pods to run:

* React frontend
* Flask backend
* MySQL database

Check NEXA Pods:

```bash
kubectl get pods -n nexa
```

Example:

```text
NAME                        READY   STATUS    RESTARTS
backend-xxxxxxxxxx-xxxxx    1/1     Running   0
backend-xxxxxxxxxx-xxxxx    1/1     Running   0
frontend-xxxxxxxxxx-xxxxx   1/1     Running   0
frontend-xxxxxxxxxx-xxxxx   1/1     Running   0
mysql-xxxxxxxxxx-xxxxx      1/1     Running   0
```

### Detailed Pod information

```bash
kubectl describe pod <pod-name> -n nexa
```

### View Pod logs

Backend:

```bash
kubectl logs deployment/backend -n nexa
```

Frontend:

```bash
kubectl logs deployment/frontend -n nexa
```

---

# 4. Deployments

Kubernetes Deployments manage the desired state of application Pods.

NEXA uses Deployments for:

```text
backend
frontend
mysql
```

Check Deployments:

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

The backend and frontend use multiple replicas to improve availability.

### Describe a Deployment

```bash
kubectl describe deployment backend -n nexa
```

### View Deployment YAML

```bash
kubectl get deployment backend -n nexa -o yaml
```

---

# 5. Services

Kubernetes Services provide stable networking endpoints for Pods.

NEXA uses Services for:

```text
frontend
backend
mysql
```

Check Services:

```bash
kubectl get svc -n nexa
```

Example:

```text
NAME       TYPE        CLUSTER-IP       PORT(S)
backend    ClusterIP   <cluster-ip>     5000/TCP
frontend   ClusterIP   <cluster-ip>     80/TCP
mysql      ClusterIP   <cluster-ip>     3306/TCP
```

### Backend Service

The backend Service provides a stable endpoint for the Flask application.

```text
backend:5000
```

### MySQL Service

The backend communicates with MySQL through the Kubernetes Service:

```text
mysql:3306
```

This avoids depending on a Pod IP, because Pod IP addresses can change when Pods are recreated.

---

# 6. Ingress

Ingress manages external HTTP/HTTPS access to Kubernetes applications.

NEXA uses an AWS Application Load Balancer through the Kubernetes Ingress configuration.

Check Ingress:

```bash
kubectl get ingress -n nexa
```

Example:

```text
NAME           CLASS   HOSTS   ADDRESS
nexa-ingress   alb     *       <AWS-ALB-DNS>
```

### Traffic Flow

```text
Internet
    |
    v
AWS Application Load Balancer
    |
    v
NEXA Ingress
    |
    +-------------> Frontend Service
    |
    +-------------> Backend Service
```

The ALB provides the external entry point for the NEXA application.

### Describe Ingress

```bash
kubectl describe ingress nexa-ingress -n nexa
```

---

# 7. ConfigMaps and Secrets

Kubernetes provides ConfigMaps and Secrets for application configuration.

## ConfigMaps

ConfigMaps are used for non-sensitive configuration values.

Check ConfigMaps:

```bash
kubectl get configmaps -n nexa
```

Describe a ConfigMap:

```bash
kubectl describe configmap <configmap-name> -n nexa
```

---

## Secrets

Secrets are used to store sensitive configuration such as:

* Database credentials
* Passwords
* Authentication values
* Other sensitive application configuration

Check Secrets:

```bash
kubectl get secrets -n nexa
```

Describe a Secret:

```bash
kubectl describe secret <secret-name> -n nexa
```

**Do not commit actual secret values to GitHub.**

Secrets should be managed separately from application source code and protected using appropriate access controls.

---

# 8. Horizontal Pod Autoscaler

Horizontal Pod Autoscaler (HPA) automatically adjusts the number of Pods based on resource utilization.

NEXA has HPA configured for:

```text
backend
frontend
```

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

Example:

```text
NAME       REFERENCE             TARGETS    MINPODS   MAXPODS   REPLICAS
backend    Deployment/backend    6%/70%     2         5         2
frontend   Deployment/frontend   1%/70%     2         5         2
```

If CPU utilization increases beyond the configured target, Kubernetes can increase the number of replicas.

If resource usage decreases, Kubernetes can scale the workloads back down while respecting the minimum replica count.

---

# 9. Rolling Updates

NEXA uses Kubernetes rolling updates to deploy new application versions without immediately terminating all existing Pods.

The CI/CD pipeline updates the image using:

```bash
kubectl set image deployment/backend \
backend=rahulgowda526/nexa-backend:<commit-sha> \
-n nexa
```

For the frontend:

```bash
kubectl set image deployment/frontend \
frontend=rahulgowda526/nexa-frontend:<commit-sha> \
-n nexa
```

Kubernetes then gradually replaces the old Pods with new Pods.

### Rollout Status

Backend:

```bash
kubectl rollout status deployment/backend -n nexa
```

Frontend:

```bash
kubectl rollout status deployment/frontend -n nexa
```

### View Rollout History

```bash
kubectl rollout history deployment/backend -n nexa
```

```bash
kubectl rollout history deployment/frontend -n nexa
```

### Rollback

If a deployment has a problem, the previous revision can be restored:

```bash
kubectl rollout undo deployment/backend -n nexa
```

```bash
kubectl rollout undo deployment/frontend -n nexa
```

---

# 10. Kubernetes Health Verification

After deploying or updating the application, verify the workloads.

### Pods

```bash
kubectl get pods -n nexa
```

### Deployments

```bash
kubectl get deployments -n nexa
```

### Services

```bash
kubectl get svc -n nexa
```

### Ingress

```bash
kubectl get ingress -n nexa
```

### HPA

```bash
kubectl get hpa -n nexa
```

### All NEXA resources

```bash
kubectl get all -n nexa
```

---

# 11. Troubleshooting Commands

### Check Pod details

```bash
kubectl describe pod <pod-name> -n nexa
```

### Check application logs

```bash
kubectl logs <pod-name> -n nexa
```

### Follow logs

```bash
kubectl logs -f <pod-name> -n nexa
```

### Check Deployment events

```bash
kubectl describe deployment backend -n nexa
```

### Check recent namespace events

```bash
kubectl get events -n nexa --sort-by=.lastTimestamp
```

### Check nodes

```bash
kubectl get nodes
```

---

# 12. NEXA Kubernetes Workflow

```text
Docker Image
     |
     v
Kubernetes Deployment
     |
     v
     Pods
     |
     v
 Kubernetes Service
     |
     v
    Ingress
     |
     v
 AWS Application Load Balancer
     |
     v
     Users
```

For scaling:

```text
Pod CPU Usage
      |
      v
     HPA
      |
      v
Increase / Decrease Replicas
```

For application updates:

```text
New Docker Image
      |
      v
kubectl set image
      |
      v
Deployment
      |
      v
Rolling Update
      |
      v
New Pods
      |
      v
Rollout Verification
```

---

# 13. Key Kubernetes Concepts Demonstrated

This project demonstrates practical usage of:

* Kubernetes Namespaces
* Pods
* Deployments
* Services
* Ingress
* ConfigMaps
* Secrets
* Horizontal Pod Autoscaling
* Rolling Updates
* Rollbacks
* Kubernetes networking
* Kubernetes troubleshooting
* Amazon EKS

The NEXA Dashboard uses these Kubernetes components to provide a scalable and manageable application deployment on AWS.
