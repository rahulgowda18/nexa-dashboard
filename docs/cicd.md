# NEXA Dashboard — CI/CD Pipeline

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline implemented for the NEXA Dashboard.

The pipeline automatically builds Docker images, pushes them to Docker Hub, connects to Amazon EKS, updates the Kubernetes deployments, and verifies the rollout.

---

# 1. CI/CD Architecture

The complete pipeline is:

```text
Developer
    |
    | git push
    v
+----------------+
|    GitHub      |
+-------+--------+
        |
        | Push to main
        v
+------------------------+
|    GitHub Actions      |
|        CI/CD           |
+-----------+------------+
            |
            v
     Build Docker Images
            |
       +----+----+
       |         |
       v         v
   Backend    Frontend
       |         |
       +----+----+
            |
            v
       Docker Hub
            |
            v
   Configure AWS
    Credentials
            |
            v
       Connect to
         EKS
            |
            v
     kubectl set image
            |
            v
    Kubernetes Rolling
        Deployment
            |
            v
     Verify Rollout
```

---

# 2. Pipeline Trigger

The workflow is triggered whenever code is pushed to the `main` branch.

```yaml
on:
  push:
    branches:
      - main
```

Therefore:

```text
git push origin main
        ↓
GitHub Actions starts
```

This provides automatic deployment whenever changes are pushed to the main branch.

---

# 3. Checkout Source Code

The first step checks out the repository source code.

```yaml
- name: Checkout code
  uses: actions/checkout@v4
```

This makes the application source code available to the GitHub Actions runner.

---

# 4. Configure Docker Buildx

Docker Buildx is configured for building the application images.

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
```

This prepares the CI environment for Docker image builds.

---

# 5. Docker Hub Authentication

GitHub Actions authenticates with Docker Hub using GitHub Secrets.

```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

Credentials are stored as GitHub Actions Secrets rather than being written directly into the workflow.

---

# 6. Build and Push Backend Image

The backend Docker image is built from the `backend` directory.

```yaml
- name: Build and push backend
  uses: docker/build-push-action@v6
  with:
    context: ./backend
    push: true
    tags: |
      ${{ secrets.DOCKERHUB_USERNAME }}/nexa-backend:latest
      ${{ secrets.DOCKERHUB_USERNAME }}/nexa-backend:${{ github.sha }}
```

The backend image is published to:

```text
rahulgowda526/nexa-backend
```

Two tags are created:

```text
latest
<Git commit SHA>
```

---

# 7. Build and Push Frontend Image

The frontend Docker image is built from the `frontend` directory.

```yaml
- name: Build and push frontend
  uses: docker/build-push-action@v6
  with:
    context: ./frontend
    push: true
    tags: |
      ${{ secrets.DOCKERHUB_USERNAME }}/nexa-frontend:latest
      ${{ secrets.DOCKERHUB_USERNAME }}/nexa-frontend:${{ github.sha }}
```

The frontend image is published to:

```text
rahulgowda526/nexa-frontend
```

Again, both `latest` and the Git commit SHA are used as tags.

---

# 8. Git Commit SHA Image Tagging

One of the important features of this CI/CD pipeline is **immutable image tagging using the Git commit SHA**.

GitHub provides the commit SHA through:

```text
${{ github.sha }}
```

For example:

```text
rahulgowda526/nexa-backend:fd2d367dd6f39a8e8582a5c131d57f9a4fc615ec
```

and:

```text
rahulgowda526/nexa-frontend:fd2d367dd6f39a8e8582a5c131d57f9a4fc615ec
```

This creates a clear relationship:

```text
Git Commit
    ↓
Docker Image
    ↓
Kubernetes Deployment
```

### Why use the Git SHA?

Using the commit SHA makes the deployed version:

* Traceable
* Reproducible
* Easy to identify
* Safer than relying only on `latest`

For example, if a deployment has a problem, the exact Git commit used to create the running container can be identified.

This is an important production-style CI/CD practice.

---

# 9. Configure AWS Credentials

The pipeline authenticates with AWS using GitHub Actions Secrets.

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ap-south-1
```

The AWS credentials are stored securely in GitHub Secrets.

The deployment region is:

```text
ap-south-1
```

---

# 10. Connect to Amazon EKS

The workflow configures `kubectl` to communicate with the EKS cluster.

```bash
aws eks update-kubeconfig \
  --region ap-south-1 \
  --name nexa-eks
```

The cluster is:

```text
nexa-eks
```

After this step, the GitHub Actions runner can execute Kubernetes commands against the EKS cluster.

---

# 11. Update Backend Deployment

The backend Kubernetes deployment is updated using:

```bash
kubectl set image deployment/backend \
  backend=${{ secrets.DOCKERHUB_USERNAME }}/nexa-backend:${{ github.sha }} \
  -n nexa
```

The important part is:

```text
:${{ github.sha }}
```

This tells Kubernetes to deploy the Docker image corresponding to the exact Git commit that triggered the workflow.

---

# 12. Update Frontend Deployment

The frontend deployment is updated similarly:

```bash
kubectl set image deployment/frontend \
  frontend=${{ secrets.DOCKERHUB_USERNAME }}/nexa-frontend:${{ github.sha }} \
  -n nexa
```

The deployment occurs in the:

```text
nexa
```

namespace.

---

# 13. Kubernetes Rolling Deployment

When the image is changed, Kubernetes performs a rolling update.

```text
Old Pods
   |
   v
New Pod created
   |
   v
New Pod becomes Ready
   |
   v
Old Pod terminated
   |
   v
Next Pod updated
```

This avoids immediately shutting down all application replicas.

For the NEXA backend and frontend, multiple replicas are available during normal operation.

---

# 14. Verify Backend Rollout

The pipeline waits for the backend deployment to complete:

```bash
kubectl rollout status deployment/backend \
  -n nexa \
  --timeout=180s
```

If the rollout completes successfully, the workflow continues.

If the rollout does not complete within the configured timeout, the workflow fails.

---

# 15. Verify Frontend Rollout

The frontend deployment is verified using:

```bash
kubectl rollout status deployment/frontend \
  -n nexa \
  --timeout=180s
```

This confirms that Kubernetes successfully completed the frontend update.

---

# 16. Final Deployment Verification

The workflow displays the final Kubernetes state:

```bash
echo "===== NEXA PODS ====="
kubectl get pods -n nexa

echo "===== NEXA SERVICES ====="
kubectl get svc -n nexa

echo "===== NEXA DEPLOYMENTS ====="
kubectl get deployments -n nexa
```

This provides visibility into:

* Running Pods
* Kubernetes Services
* Deployment replica status

---

# 17. Complete CI/CD Flow

The complete NEXA CI/CD workflow is:

```text
Developer
    |
    | git push origin main
    v
GitHub
    |
    v
GitHub Actions
    |
    +-----------------------------+
    |                             |
    v                             v
Build Backend               Build Frontend
Docker Image                Docker Image
    |                             |
    +-------------+---------------+
                  |
                  v
              Docker Hub
                  |
                  v
        Configure AWS Credentials
                  |
                  v
             EKS kubeconfig
                  |
                  v
          kubectl set image
                  |
          +-------+-------+
          |               |
          v               v
       Backend         Frontend
      Deployment      Deployment
          |               |
          +-------+-------+
                  |
                  v
          Rolling Update
                  |
                  v
          Rollout Verification
                  |
                  v
          Deployment Complete
```

---

# 18. GitHub Actions Secrets

The pipeline uses the following GitHub Secrets:

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

These values are not stored directly in the repository.

The workflow references them through:

```yaml
${{ secrets.SECRET_NAME }}
```

---

# 19. Deployment Verification Commands

The same Kubernetes commands can be used manually to verify the deployment.

### Check Pods

```bash
kubectl get pods -n nexa
```

### Check Deployments

```bash
kubectl get deployments -n nexa
```

### Check Services

```bash
kubectl get svc -n nexa
```

### Check Ingress

```bash
kubectl get ingress -n nexa
```

### Check HPA

```bash
kubectl get hpa -n nexa
```

---

# 20. CI/CD Benefits

The NEXA CI/CD pipeline provides:

* Automated Docker image builds
* Automated Docker Hub publishing
* Automated EKS deployment
* Git commit-based image versioning
* Kubernetes rolling updates
* Automated rollout verification
* Secure credential management through GitHub Secrets
* Reduced manual deployment steps
* Traceability between source code and deployed containers

---

# 21. Interview Explanation

A concise explanation of the pipeline:

> "I implemented a GitHub Actions CI/CD pipeline for my NEXA Dashboard. Whenever I push code to the main branch, GitHub Actions checks out the code, builds separate Docker images for the React frontend and Flask backend, and pushes them to Docker Hub. I tag the images with the Git commit SHA so every deployment can be traced back to an exact source-code version. The pipeline then configures AWS credentials, connects to my EKS cluster, and uses `kubectl set image` to update the Kubernetes deployments. Kubernetes performs a rolling update, and the pipeline waits for both frontend and backend rollouts to complete successfully before reporting the final deployment status."
