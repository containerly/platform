# Operations

This document provides comprehensive operational procedures for administrating the Platform CDK8s deployment and managing the platform lifecycle.

## Overview

The Platform CDK8s project requires several operational procedures for successful deployment, maintenance, and troubleshooting. This guide covers all administrative tasks required to operate the platform effectively.

## Prerequisites

### Required Access

- **Kubernetes Cluster Access**: kubectl configured with appropriate permissions
- **GitHub Repository Access**: Read access to the containerly/platform repository
- **NPM Registry Access**: Access to GitHub Packages (for consuming the NPM package)
- **Administrative Privileges**: Cluster administrator or namespace administrator rights

### Required Tools

- **kubectl**: Kubernetes command-line interface
- **Node.js**: 18.x or 20.x for local development
- **npm**: Package manager for consuming published packages
- **Git**: For repository operations

### Kubernetes Cluster Requirements

- **Kubernetes Version**: 1.20 or later
- **Operator Lifecycle Manager (OLM)**: Required for operator deployment
- **Sufficient Resources**: Minimum 4 CPU cores, 8GB RAM
- **Storage Classes**: Available for persistent storage
- **Network Policies**: Configured if network isolation is required

## Installation Procedures

### Method 1: Using Published NPM Package

#### Step 1: Configure NPM Registry

```bash
# Configure npm to use GitHub Packages for @containerly scope
npm config set @containerly:registry https://npm.pkg.github.com
```

#### Step 2: Install Package

```bash
# Install the platform package
npm install @containerly/platform
```

#### Step 3: Generate Manifests

```bash
# Generate Kubernetes manifests
npx cdk8s synth
```

#### Step 4: Deploy to Kubernetes

```bash
# Apply manifests to cluster
kubectl apply -f dist/platform.k8s.yaml
```

### Method 2: Using Pre-built Manifests

#### Step 1: Download Release Artifacts

```bash
# Download from GitHub Releases
curl -L -o platform.k8s.yaml https://github.com/containerly/platform/releases/latest/download/platform.k8s.yaml
```

#### Step 2: Deploy to Kubernetes

```bash
# Apply manifests to cluster
kubectl apply -f platform.k8s.yaml
```

### Method 3: Using Repository Scripts

#### Step 1: Clone Repository

```bash
git clone https://github.com/containerly/platform.git
cd platform
```

#### Step 2: Install Dependencies

```bash
npm ci
```

#### Step 3: Deploy Platform

```bash
# Use the provided installation script
./script/install
```

## Pre-Deployment Setup

### Operator Lifecycle Manager (OLM) Installation

OLM is required for operator deployment. Install if not already present:

```bash
# Install OLM using the provided script
./script/olm
```

Manual OLM installation:

```bash
# Install operator-sdk (macOS)
brew install operator-sdk

# Install OLM
operator-sdk olm install

# Verify OLM installation
kubectl get pods -n olm
kubectl get pods -n operators
```

### Namespace Preparation

The platform creates required namespaces automatically:

- `operators`: General operator deployment namespace
- `flux-system`: Flux operator dedicated namespace

Verify namespace creation:

```bash
# Check namespace creation
kubectl get namespaces | grep -E "(operators|flux-system)"
```

### Resource Quotas and Limits

Consider setting resource quotas for operator namespaces:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: operator-quota
  namespace: operators
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "20"
```

## Deployment Verification

### Operator Deployment Status

Monitor operator installation progress:

```bash
# Check subscription status
kubectl get subscriptions -n operators

# Check install plans
kubectl get installplans -n operators

# Check cluster service versions
kubectl get csv -n operators
```

### Operator Health Checks

Verify each operator is running correctly:

```bash
# Check operator pods
kubectl get pods -n operators

# Check operator logs
kubectl logs -n operators deployment/prometheus-operator
kubectl logs -n operators deployment/grafana-operator
kubectl logs -n operators deployment/loki-operator

# Check operator events
kubectl get events -n operators --sort-by='.lastTimestamp'
```

### Platform Component Status

Verify platform components are operational:

```bash
# Check all platform resources
kubectl get all -n operators
kubectl get all -n flux-system

# Check custom resources
kubectl get prometheus -A
kubectl get grafana -A
kubectl get kafka -A
```

## Operational Procedures

### Upgrade Procedures

#### Automatic Operator Upgrades

Operators with `installPlanApproval: Automatic` upgrade automatically:

```bash
# Monitor automatic upgrades
kubectl get installplans -n operators

# Check upgrade status
kubectl describe installplan -n operators INSTALL_PLAN_NAME
```

#### Manual Operator Upgrades

For operators requiring manual approval:

```bash
# List pending install plans
kubectl get installplans -n operators -o json | jq '.items[] | select(.spec.approved == false)'

# Approve upgrade
kubectl patch installplan -n operators INSTALL_PLAN_NAME --type='merge' -p='{"spec":{"approved":true}}'
```

#### Platform Version Upgrades

To upgrade to a new platform version:

```bash
# Method 1: Using NPM package
npm update @containerly/platform
npx cdk8s synth
kubectl apply -f dist/platform.k8s.yaml

# Method 2: Using repository
git pull origin main
npm ci
npm run build
./script/install
```

### Configuration Management

#### Operator Configuration Changes

Modify operator configurations by updating custom resources:

```bash
# List operator custom resources
kubectl api-resources --api-group=operators.coreos.com

# Edit subscription configurations
kubectl edit subscription prometheus-subscription -n operators
```

#### Platform Configuration Updates

Update platform configuration by modifying the main.ts file and redeploying:

```bash
# Update main.ts with new configuration
# Rebuild and redeploy
npm run build
kubectl apply -f dist/platform.k8s.yaml
```

### Backup Procedures

#### Configuration Backup

Backup all platform configurations:

```bash
# Backup subscriptions
kubectl get subscriptions -n operators -o yaml > subscriptions-backup.yaml
kubectl get subscriptions -n flux-system -o yaml >> subscriptions-backup.yaml

# Backup operator groups
kubectl get operatorgroups -A -o yaml > operatorgroups-backup.yaml

# Backup custom resources
kubectl get prometheus -A -o yaml > prometheus-backup.yaml
kubectl get grafana -A -o yaml > grafana-backup.yaml
kubectl get kafka -A -o yaml > kafka-backup.yaml
```

#### Data Backup

Backup persistent data according to operator documentation:

```bash
# Prometheus data backup
kubectl exec -n prometheus prometheus-pod -- tar -czf /tmp/prometheus-data.tar.gz /prometheus

# Grafana configuration backup
kubectl get configmaps -n grafana -o yaml > grafana-config-backup.yaml

# Kafka topic backup
kubectl exec -n kafka kafka-cluster-kafka-0 -- kafka-topics --bootstrap-server localhost:9092 --list > kafka-topics-backup.txt
```

### Monitoring and Alerting

#### Platform Health Monitoring

Monitor platform health using these metrics:

```bash
# Check operator memory usage
kubectl top pods -n operators

# Check subscription status
kubectl get subscriptions -n operators -o wide

# Check failed installs
kubectl get installplans -n operators -o json | jq '.items[] | select(.status.phase == "Failed")'
```

#### Log Aggregation

Collect logs from all platform components:

```bash
# Operator logs
kubectl logs deployment/prometheus-operator -n operators > prometheus-operator.log
kubectl logs deployment/grafana-operator -n operators > grafana-operator.log
kubectl logs deployment/loki-operator -n operators > loki-operator.log

# System logs
kubectl logs -n olm deployment/catalog-operator > catalog-operator.log
kubectl logs -n olm deployment/olm-operator > olm-operator.log
```

#### Alert Configuration

Configure alerts for platform health:

```yaml
# Example PrometheusRule for operator monitoring
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: platform-operator-alerts
  namespace: operators
spec:
  groups:
  - name: platform.operators
    rules:
    - alert: OperatorDown
      expr: up{job="operator-metrics"} == 0
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Operator {{ $labels.instance }} is down"
```

## Maintenance Procedures

### Regular Maintenance Tasks

#### Weekly Tasks

1. **Check Operator Health**
   ```bash
   kubectl get pods -n operators
   kubectl get csv -n operators
   ```

2. **Review Resource Usage**
   ```bash
   kubectl top pods -n operators
   kubectl top nodes
   ```

3. **Check for Pending Upgrades**
   ```bash
   kubectl get installplans -n operators -o json | jq '.items[] | select(.spec.approved == false)'
   ```

#### Monthly Tasks

1. **Review Platform Versions**
   ```bash
   npm outdated @containerly/platform
   ```

2. **Update Dependencies**
   ```bash
   npm update @containerly/platform
   ```

3. **Backup Verification**
   ```bash
   # Test backup restoration procedures
   ```

### Scaling Procedures

#### Vertical Scaling

Increase operator resource limits:

```bash
# Edit operator deployment
kubectl edit deployment prometheus-operator -n operators

# Update resource limits
spec:
  template:
    spec:
      containers:
      - name: prometheus-operator
        resources:
          limits:
            cpu: 500m
            memory: 512Mi
          requests:
            cpu: 100m
            memory: 128Mi
```

#### Horizontal Scaling

Some operators support horizontal scaling:

```bash
# Scale operator deployment
kubectl scale deployment prometheus-operator -n operators --replicas=2

# Verify scaling
kubectl get deployment prometheus-operator -n operators
```

### Disaster Recovery

#### Recovery Preparation

1. **Document Current State**
   ```bash
   kubectl get all -A > cluster-state.yaml
   kubectl get pv,pvc -A > storage-state.yaml
   ```

2. **Create Recovery Plan**
   - Identify critical data
   - Document restore procedures
   - Test recovery in staging environment

#### Recovery Procedures

1. **Platform Restoration**
   ```bash
   # Reinstall OLM if needed
   ./script/olm
   
   # Restore platform
   kubectl apply -f platform.k8s.yaml
   
   # Restore custom resources
   kubectl apply -f prometheus-backup.yaml
   kubectl apply -f grafana-backup.yaml
   ```

2. **Data Restoration**
   ```bash
   # Restore persistent volumes
   kubectl apply -f storage-state.yaml
   
   # Restore operator data
   # Follow operator-specific restore procedures
   ```

## Security Operations

### Security Monitoring

#### RBAC Monitoring

Monitor role-based access control:

```bash
# Check operator service accounts
kubectl get serviceaccounts -n operators

# Review operator roles
kubectl get roles -n operators
kubectl get clusterroles | grep -E "(prometheus|grafana|loki)"

# Check role bindings
kubectl get rolebindings -n operators
kubectl get clusterrolebindings | grep -E "(prometheus|grafana|loki)"
```

#### Security Scanning

Scan operator images for vulnerabilities:

```bash
# Get operator images
kubectl get pods -n operators -o jsonpath='{.items[*].spec.containers[*].image}'

# Scan images (example with trivy)
trivy image quay.io/prometheus-operator/prometheus-operator:latest
```

### Access Control

#### User Access Management

Manage access to platform resources:

```bash
# Create role for platform management
kubectl create role platform-manager --verb=get,list,watch,create,update,patch,delete --resource=subscriptions,operatorgroups -n operators

# Bind role to user
kubectl create rolebinding platform-manager-binding --role=platform-manager --user=admin@company.com -n operators
```

#### Service Account Management

Manage operator service accounts:

```bash
# List operator service accounts
kubectl get serviceaccounts -n operators

# Review service account permissions
kubectl describe serviceaccount prometheus-operator -n operators
```

## Troubleshooting Operations

### Common Issues

#### Operator Installation Failures

```bash
# Check install plan status
kubectl get installplans -n operators -o yaml

# Check subscription status
kubectl describe subscription prometheus-subscription -n operators

# Check operator pod logs
kubectl logs deployment/prometheus-operator -n operators
```

#### Resource Conflicts

```bash
# Check for resource conflicts
kubectl get events -n operators --sort-by='.lastTimestamp'

# Check resource ownership
kubectl get csv -n operators -o yaml | grep -A 5 -B 5 "ownerReferences"
```

#### Performance Issues

```bash
# Check resource usage
kubectl top pods -n operators
kubectl top nodes

# Check for resource constraints
kubectl describe pod prometheus-operator-pod -n operators | grep -A 10 "Limits"
```

### Diagnostic Procedures

#### Collecting Diagnostic Information

```bash
# Create diagnostic bundle
mkdir platform-diagnostics-$(date +%Y%m%d)
cd platform-diagnostics-$(date +%Y%m%d)

# Collect platform state
kubectl get all -n operators -o yaml > operators-state.yaml
kubectl get all -n flux-system -o yaml > flux-state.yaml

# Collect operator logs
kubectl logs deployment/prometheus-operator -n operators > prometheus-operator.log
kubectl logs deployment/grafana-operator -n operators > grafana-operator.log

# Collect events
kubectl get events -A --sort-by='.lastTimestamp' > cluster-events.log

# Collect node information
kubectl get nodes -o yaml > nodes.yaml
kubectl describe nodes > nodes-describe.txt
```

#### Performance Analysis

```bash
# Analyze resource usage
kubectl top pods -n operators --sort-by=cpu
kubectl top pods -n operators --sort-by=memory

# Check for resource constraints
kubectl get pods -n operators -o json | jq '.items[] | select(.status.phase != "Running")'
```

## Compliance and Auditing

### Audit Procedures

#### Configuration Auditing

```bash
# Audit operator configurations
kubectl get subscriptions -n operators -o yaml | grep -E "(channel|source|installPlanApproval)"

# Audit RBAC configurations
kubectl get rolebindings,clusterrolebindings -A -o yaml | grep -E "(prometheus|grafana|loki)"
```

#### Change Tracking

Track changes to platform configuration:

```bash
# Track subscription changes
kubectl get subscriptions -n operators -o yaml --show-managed-fields

# Track custom resource changes
kubectl get prometheus -A -o yaml --show-managed-fields
```

### Compliance Reporting

Generate compliance reports:

```bash
# Security compliance report
kubectl get pods -n operators -o json | jq '.items[] | {name: .metadata.name, securityContext: .spec.securityContext}'

# Resource compliance report
kubectl get pods -n operators -o json | jq '.items[] | {name: .metadata.name, resources: .spec.containers[].resources}'
```

## Best Practices

### Operational Best Practices

1. **Regular Monitoring**: Implement continuous monitoring of platform health
2. **Automated Backups**: Schedule regular backups of configurations and data
3. **Change Management**: Use version control for all configuration changes
4. **Documentation**: Maintain up-to-date operational documentation
5. **Testing**: Test all procedures in staging environments first

### Security Best Practices

1. **Least Privilege**: Grant minimum required permissions
2. **Regular Updates**: Keep operators and platform up to date
3. **Monitoring**: Monitor for security events and anomalies
4. **Access Control**: Implement proper access controls and authentication
5. **Vulnerability Scanning**: Regularly scan for security vulnerabilities

### Performance Best Practices

1. **Resource Limits**: Set appropriate resource limits for operators
2. **Monitoring**: Monitor resource usage and performance metrics
3. **Scaling**: Scale operators based on workload requirements
4. **Optimization**: Optimize configurations for performance
5. **Capacity Planning**: Plan for future growth and scaling needs

## Contact and Support

For operational issues:

1. **Check Documentation**: Review this operations guide and troubleshooting section
2. **Review Logs**: Collect and analyze relevant logs
3. **Create Issues**: Report problems via GitHub Issues
4. **Emergency Procedures**: Follow established incident response procedures

## Appendix

### Useful Commands Reference

```bash
# Platform status overview
kubectl get subscriptions,operatorgroups,csv -A

# Operator health check
kubectl get pods -n operators -o wide

# Resource usage check
kubectl top pods -n operators --sort-by=memory

# Event monitoring
kubectl get events -A --sort-by='.lastTimestamp' | tail -20

# Backup creation
kubectl get subscriptions -A -o yaml > platform-backup-$(date +%Y%m%d).yaml
```

### Configuration Templates

#### Operator Resource Quota Template

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: operator-resource-quota
  namespace: operators
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "20"
    persistentvolumeclaims: "10"
```

#### Monitoring Configuration Template

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: platform-operators
  namespace: operators
spec:
  selector:
    matchLabels:
      app.kubernetes.io/component: operator
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
```