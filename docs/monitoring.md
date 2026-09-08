# NEXA Dashboard — Monitoring

This document describes the monitoring solution implemented for the NEXA Dashboard running on Amazon EKS.

The monitoring stack uses **Prometheus** for metrics collection and **Grafana** for visualization.

---

# 1. Monitoring Architecture

```text
                    AWS EKS
                       |
                       v
             Kubernetes Workloads
                       |
          +------------+------------+
          |            |            |
          v            v            v
       Frontend     Backend       MySQL
          Pods        Pods          Pod
          |
          +------------------------+
                                   |
                                   v
                         Kubernetes Metrics
                                   |
                                   v
                              Prometheus
                                   |
                                   v
                               Grafana
                                   |
                                   v
                     NEXA EKS Monitoring
                              Dashboard
```

The monitoring stack runs in a separate Kubernetes namespace:

```text
monitoring
```

The NEXA application runs in:

```text
nexa
```

---

# 2. Monitoring Components

The monitoring solution uses the **kube-prometheus-stack** Helm chart.

It provides several Kubernetes monitoring components:

```text
Prometheus
Grafana
Alertmanager
Prometheus Operator
kube-state-metrics
node-exporter
```

The stack collects metrics from the Kubernetes cluster and workloads.

---

# 3. Install Monitoring Stack

The monitoring stack was installed using Helm.

Add the Prometheus Community repository:

```bash
helm repo add prometheus-community \
https://prometheus-community.github.io/helm-charts
```

Update the repository:

```bash
helm repo update
```

Create the monitoring namespace:

```bash
kubectl create namespace monitoring
```

Install the monitoring stack:

```bash
helm install monitoring \
prometheus-community/kube-prometheus-stack \
-n monitoring
```

---

# 4. Verify Monitoring Pods

Check the monitoring Pods:

```bash
kubectl get pods -n monitoring
```

The monitoring namespace contains components such as:

```text
Alertmanager
Grafana
Prometheus
Prometheus Operator
kube-state-metrics
node-exporter
```

All major monitoring components should reach:

```text
STATUS: Running
```

---

# 5. Prometheus

Prometheus is responsible for collecting and storing time-series metrics.

The Prometheus Service is:

```text
monitoring-kube-prometheus-prometheus
```

Check Services:

```bash
kubectl get svc -n monitoring
```

The Prometheus service listens on:

```text
9090
```

### Prometheus Port Forwarding

For local access to the Prometheus interface:

```bash
kubectl port-forward \
-n monitoring \
svc/monitoring-kube-prometheus-prometheus \
9090:9090
```

Prometheus can then be accessed locally at:

```text
http://localhost:9090
```

---

# 6. Verify Prometheus Metrics

A basic Prometheus health check can be performed using the `up` query:

```promql
up
```

A value of:

```text
1
```

indicates that the corresponding target is being successfully scraped.

The NEXA monitoring environment successfully collected metrics from Kubernetes components including:

* kubelet
* node-exporter
* kube-proxy
* CoreDNS
* kube-state-metrics
* Kubernetes API server
* Prometheus
* Grafana
* Alertmanager

---

# 7. Grafana

Grafana provides dashboards for visualizing Prometheus metrics.

The Grafana Service is:

```text
monitoring-grafana
```

Check the Service:

```bash
kubectl get svc -n monitoring
```

For local access:

```bash
kubectl port-forward \
-n monitoring \
svc/monitoring-grafana \
3000:80
```

Grafana can then be accessed at:

```text
http://localhost:3000
```

---

# 8. Prometheus Data Source

Grafana uses Prometheus as its data source.

Inside the Kubernetes cluster, Prometheus is accessed using its Kubernetes DNS name:

```text
http://monitoring-kube-prometheus-prometheus.monitoring.svc.cluster.local:9090
```

This allows Grafana to query Prometheus metrics directly inside the EKS cluster.

---

# 9. NEXA EKS Monitoring Dashboard

A custom Grafana dashboard named:

```text
NEXA EKS Monitoring
```

was created for monitoring the NEXA application and EKS infrastructure.

The dashboard contains the following panels.

---

# 10. EKS Node CPU Usage

This panel monitors CPU utilization across EKS nodes.

PromQL:

```promql
100 * (
  1 - avg by (instance) (
    rate(node_cpu_seconds_total{mode="idle"}[5m])
  )
)
```

The result represents approximate CPU utilization as a percentage.

---

# 11. EKS Node Memory Usage

This panel monitors memory utilization on EKS nodes.

PromQL:

```promql
100 * (
  1 - (
    node_memory_MemAvailable_bytes /
    node_memory_MemTotal_bytes
  )
)
```

This provides the percentage of node memory currently being used.

---

# 12. NEXA Pod Restarts

This panel tracks container restart counts for NEXA Pods.

PromQL:

```promql
sum by (namespace, pod) (
  kube_pod_container_status_restarts_total{
    namespace="nexa"
  }
)
```

Unexpected increases in restart counts can indicate:

* Application crashes
* Container failures
* Resource problems
* Configuration issues

---

# 13. NEXA Running Pods

This panel displays the number of running NEXA Pods.

PromQL:

```promql
sum by (pod) (
  kube_pod_status_phase{
    namespace="nexa",
    phase="Running"
  }
)
```

This helps verify whether application Pods are running normally.

---

# 14. NEXA Pod CPU Usage

This panel tracks CPU consumption by NEXA Pods.

PromQL:

```promql
sum by (pod) (
  rate(
    container_cpu_usage_seconds_total{
      namespace="nexa",
      container!="",
      container!="POD"
    }[5m]
  )
) * 100
```

This can help identify workloads consuming unusually high CPU resources.

---

# 15. NEXA Pod Memory Usage

This panel displays Pod memory consumption in megabytes.

PromQL:

```promql
sum by (pod) (
  container_memory_working_set_bytes{
    namespace="nexa",
    container!="",
    container!="POD"
  }
) / 1024 / 1024
```

This helps monitor memory consumption of application workloads.

---

# 16. NEXA Pod Health

This panel monitors whether NEXA Pods are reporting a Ready condition.

PromQL:

```promql
sum by (pod) (
  kube_pod_status_ready{
    namespace="nexa",
    condition="true"
  }
)
```

A healthy application should have its expected Pods in the Ready state.

---

# 17. NEXA Current Replicas

This panel shows the number of currently running replicas for NEXA Deployments.

PromQL:

```promql
kube_deployment_status_replicas{
  namespace="nexa"
}
```

This allows the current deployment state to be compared against the desired replica count.

---

# 18. NEXA Desired Replicas

This panel displays the number of replicas requested by the Kubernetes Deployment.

PromQL:

```promql
kube_deployment_spec_replicas{
  namespace="nexa"
}
```

Comparing desired and current replicas helps identify deployment availability problems.

---

# 19. Monitoring Dashboard Overview

The final dashboard provides visibility into:

```text
+--------------------------------------+
|       NEXA EKS Monitoring            |
+--------------------------------------+
| EKS Node CPU       | Node Memory     |
+--------------------+-----------------+
| Pod Restarts       | Running Pods    |
+--------------------+-----------------+
| Pod CPU            | Pod Memory      |
+--------------------+-----------------+
| Pod Health         | Current Replica |
+--------------------+-----------------+
| Desired Replicas                     |
+--------------------------------------+
```

This gives a centralized view of both Kubernetes infrastructure and NEXA application health.

---

# 20. Monitoring Troubleshooting Commands

### Check monitoring Pods

```bash
kubectl get pods -n monitoring
```

### Check monitoring Services

```bash
kubectl get svc -n monitoring
```

### Check Prometheus

```bash
kubectl get pods -n monitoring | grep prometheus
```

### Check Grafana

```bash
kubectl get pods -n monitoring | grep grafana
```

### Check monitoring events

```bash
kubectl get events -n monitoring \
--sort-by=.lastTimestamp
```

### Check Prometheus logs

```bash
kubectl logs \
-n monitoring \
deployment/monitoring-kube-prometheus-operator
```

---

# 21. Monitoring Verification

The monitoring implementation was verified by:

1. Confirming monitoring Pods are running.
2. Confirming Prometheus is operational.
3. Connecting Grafana to Prometheus.
4. Running the Prometheus `up` query.
5. Confirming Kubernetes metrics are available.
6. Creating the custom NEXA EKS Monitoring dashboard.
7. Adding application and infrastructure monitoring panels.

---

# 22. Monitoring Architecture Summary

```text
                    EKS Cluster
                         |
          +--------------+--------------+
          |                             |
          v                             v
   NEXA Namespace                 Monitoring Namespace
          |                             |
          |                             |
   +------+------+                +-----+------+
   |      |      |                |            |
Frontend Backend MySQL       Prometheus      Grafana
   |      |      |                |            |
   +------+------+                +-----+------+
          |                             |
          | Kubernetes metrics          |
          +------------->---------------+
                                        |
                                        v
                              NEXA EKS Monitoring
                                   Dashboard
```

---

# 23. Benefits

The monitoring implementation provides:

* EKS node resource visibility
* Application Pod monitoring
* CPU monitoring
* Memory monitoring
* Pod restart detection
* Pod health visibility
* Deployment replica monitoring
* Centralized Grafana visualization
* Prometheus-based Kubernetes metrics collection

This monitoring setup provides operational visibility into the NEXA Dashboard running on Amazon EKS.
