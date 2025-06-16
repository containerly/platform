# Prometheus Operator Custom Resources

This page provides a comprehensive reference for the Prometheus Operator Custom Resources (CRs) used in our Modern Platform Experience. These resources enable metrics collection, alerting, and alert routing by managing Prometheus instances, alert managers, and their configurations declaratively.

## Overview

The Prometheus Operator follows a reconciliation model that separates concerns across multiple Custom Resources, allowing for flexible and scalable monitoring configurations:

### Prometheus - Metrics Collection
The `Prometheus` CR defines a Prometheus server instance that scrapes metrics from various sources. It automatically discovers targets using ServiceMonitors, PodMonitors, and ScrapeConfigs, while also loading alerting rules from PrometheusRule resources.

**Lifecycle:**
1. **Discovery**: Automatically discovers monitoring targets via selectors
2. **Scrape**: Collects metrics from discovered endpoints
3. **Store**: Persists metrics in time-series database
4. **Evaluate**: Processes alerting rules and fires alerts
5. **Route**: Sends alerts to configured Alertmanager instances

### PrometheusAgent - Lightweight Metrics Collection
The `PrometheusAgent` CR defines a Prometheus instance running in agent mode, which only scrapes and forwards metrics without storing them locally. This is ideal for edge deployments or when using remote storage.

**Lifecycle:**
1. **Discovery**: Automatically discovers monitoring targets via selectors
2. **Scrape**: Collects metrics from discovered endpoints
3. **Forward**: Sends metrics to remote storage systems
4. **Reconcile**: Maintains target discovery and configuration

### Alertmanager - Alert Management
The `Alertmanager` CR defines an Alertmanager instance that handles alerts sent by Prometheus servers. It manages alert deduplication, grouping, and routing to various notification channels.

**Lifecycle:**
1. **Receive**: Accepts alerts from Prometheus instances
2. **Group**: Batches related alerts together
3. **Route**: Directs alerts to appropriate receivers
4. **Notify**: Sends notifications via configured channels
5. **Silence**: Manages alert suppression rules

### Supporting Resources

#### AlertmanagerConfig
Defines routing rules, receivers, and notification configurations for Alertmanager instances. Multiple AlertmanagerConfig resources can be combined to create complex routing topologies.

#### PrometheusRule
Contains alerting and recording rules that are loaded by Prometheus instances. Rules are automatically discovered via label selectors.

#### ScrapeConfig
Defines custom scrape configurations for metrics collection beyond the standard ServiceMonitor and PodMonitor resources.

## Field Reference

### Prometheus Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `spec.replicas` | number | `1` | Number of Prometheus replicas | Use `2` for production environments |
| `spec.serviceAccountName` | string | - | Service account for Prometheus pods | **Required** - Use `prometheus-k8s` for cluster-wide monitoring |
| `spec.serviceMonitorSelector` | object | `{}` | Selector for ServiceMonitor resources | Use `{}` to select all, or specific labels for filtering |
| `spec.ruleSelector` | object | `{}` | Selector for PrometheusRule resources | Use `{}` to select all rules in namespace |
| `spec.podMonitorSelector` | object | `{}` | Selector for PodMonitor resources | Use `{}` to select all pod monitors |
| `spec.probeSelector` | object | `{}` | Selector for Probe resources | Use `{}` to select all probes |
| `spec.alerting.alertmanagers` | array | - | Alertmanager instances to send alerts to | **Required** for alerting functionality |
| `spec.retention` | string | `30d` | Data retention period | Adjust based on storage capacity |
| `spec.storage.volumeClaimTemplate` | object | - | Persistent volume configuration | **Recommended** for production deployments |

### PrometheusAgent Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `spec.replicas` | number | `1` | Number of agent replicas | Use `2` for high availability |
| `spec.serviceAccountName` | string | - | Service account for agent pods | **Required** - Use `prometheus-k8s` for permissions |
| `spec.serviceMonitorSelector` | object | `{}` | Selector for ServiceMonitor resources | Use `{}` to select all monitors |
| `spec.podMonitorSelector` | object | `{}` | Selector for PodMonitor resources | Use `{}` to select all pod monitors |
| `spec.probeSelector` | object | `{}` | Selector for Probe resources | Use `{}` to select all probes |
| `spec.remoteWrite` | array | - | Remote write endpoints | **Required** for agent mode operation |

### Alertmanager Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `spec.replicas` | number | `1` | Number of Alertmanager replicas | Use `3` for production high availability |
| `spec.alertmanagerConfigSelector` | object | `{}` | Selector for AlertmanagerConfig resources | Use `{}` to select all configs |
| `spec.storage.volumeClaimTemplate` | object | - | Persistent volume configuration | **Recommended** for alert persistence |
| `spec.retention` | string | `120h` | Alert retention period | Adjust based on alert volume |

### AlertmanagerConfig Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `spec.route.receiver` | string | - | Default receiver for alerts | **Required** - Must match a receiver name |
| `spec.route.groupBy` | array | `['alertname']` | Fields to group alerts by | Include `cluster`, `service` for better grouping |
| `spec.route.groupWait` | string | `10s` | Wait before sending initial alert | Increase for high-volume environments |
| `spec.route.groupInterval` | string | `5m` | Wait before sending additional alerts | Balance between spam and notification speed |
| `spec.receivers` | array | - | List of notification receivers | **Required** - Define at least one receiver |

### PrometheusRule Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `spec.groups` | array | - | List of rule groups | **Required** - Contains alerting and recording rules |
| `spec.groups[].name` | string | - | Name of the rule group | Use descriptive names like `./app.rules` |
| `spec.groups[].interval` | string | `1m` | Evaluation interval | Use `30s` for critical alerts, `5m` for less urgent |
| `spec.groups[].rules` | array | - | List of rules in the group | **Required** - Contains individual alert/recording rules |

### ScrapeConfig Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `spec.staticConfigs` | array | - | Static target configurations | Use for targets not discoverable via k8s |
| `spec.kubernetesSDConfigs` | array | - | Kubernetes service discovery | **Preferred** for k8s native discovery |
| `spec.scrapeInterval` | string | `30s` | How often to scrape targets | Use `15s` for high-frequency metrics |
| `spec.metricsPath` | string | `/metrics` | Path to scrape metrics from | Override for non-standard endpoints |

## Examples

### Basic Prometheus Instance

Copy and paste this example to create a basic Prometheus instance:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  name: prometheus-main
  namespace: monitoring
spec:
  replicas: 2
  serviceAccountName: prometheus-k8s
  serviceMonitorSelector: {}
  ruleSelector: {}
  podMonitorSelector: {}
  probeSelector: {}
  alerting:
    alertmanagers:
      - namespace: monitoring
        name: alertmanager-main
        port: web
  retention: 30d
  storage:
    volumeClaimTemplate:
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 50Gi
```

### Basic PrometheusAgent

This example shows a PrometheusAgent configured for remote write:

```yaml
apiVersion: monitoring.coreos.com/v1alpha1
kind: PrometheusAgent
metadata:
  name: prometheus-agent
  namespace: monitoring
spec:
  replicas: 2
  serviceAccountName: prometheus-k8s
  serviceMonitorSelector: {}
  podMonitorSelector: {}
  probeSelector: {}
  remoteWrite:
    - url: https://prometheus-remote-write.example.com/api/v1/write
      basicAuth:
        username:
          name: remote-write-secret
          key: username
        password:
          name: remote-write-secret
          key: password
```

### Basic Alertmanager

Copy and paste this example to create an Alertmanager instance:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Alertmanager
metadata:
  name: alertmanager-main
  namespace: monitoring
spec:
  replicas: 3
  alertmanagerConfigSelector: {}
  storage:
    volumeClaimTemplate:
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
  retention: 120h
```

### AlertmanagerConfig with Routing

This example shows alert routing configuration:

```yaml
apiVersion: monitoring.coreos.com/v1alpha1
kind: AlertmanagerConfig
metadata:
  name: platform-alerts
  namespace: monitoring
spec:
  route:
    receiver: default-receiver
    groupBy: ['alertname', 'cluster', 'service']
    groupWait: 10s
    groupInterval: 5m
    repeatInterval: 4h
    routes:
      - match:
          severity: critical
        receiver: critical-alerts
        groupWait: 0s
      - match:
          team: platform
        receiver: platform-team
  receivers:
    - name: default-receiver
      slackConfigs:
        - apiURL:
            name: slack-webhook
            key: url
          channel: '#alerts'
          title: 'Platform Alert'
          text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
    - name: critical-alerts
      slackConfigs:
        - apiURL:
            name: slack-webhook
            key: url
          channel: '#critical-alerts'
          title: 'CRITICAL: Platform Alert'
          text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
    - name: platform-team
      emailConfigs:
        - to: platform-team@example.com
          from: alerts@example.com
          subject: 'Platform Alert: {{ .GroupLabels.alertname }}'
          body: |
            {{ range .Alerts }}
            Alert: {{ .Annotations.summary }}
            Description: {{ .Annotations.description }}
            {{ end }}
```

### PrometheusRule with Alerting Rules

This example contains common alerting rules:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: platform-alerting-rules
  namespace: monitoring
spec:
  groups:
    - name: ./platform.rules
      interval: 30s
      rules:
        - alert: HighErrorRate
          expr: |
            (
              rate(http_requests_total{status=~"5.."}[5m])
              /
              rate(http_requests_total[5m])
            ) > 0.1
          for: 5m
          labels:
            severity: warning
            team: platform
          annotations:
            summary: "High error rate detected"
            description: "Error rate is {{ $value | humanizePercentage }} for {{ $labels.service }}"
        
        - alert: HighMemoryUsage
          expr: |
            (
              node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes
            ) / node_memory_MemTotal_bytes > 0.9
          for: 10m
          labels:
            severity: critical
            team: platform
          annotations:
            summary: "High memory usage on node"
            description: "Memory usage is {{ $value | humanizePercentage }} on {{ $labels.instance }}"
        
        - record: instance:http_request_rate_5m
          expr: rate(http_requests_total[5m])
        
        - record: instance:http_request_error_rate_5m
          expr: rate(http_requests_total{status=~"5.."}[5m])
```

### ScrapeConfig for Custom Targets

This example shows how to scrape metrics from custom endpoints:

```yaml
apiVersion: monitoring.coreos.com/v1alpha1
kind: ScrapeConfig
metadata:
  name: custom-app-metrics
  namespace: monitoring
spec:
  staticConfigs:
    - targets:
        - 'custom-app.example.com:9090'
        - 'another-app.example.com:8080'
      labels:
        environment: production
        team: platform
  scrapeInterval: 30s
  metricsPath: /metrics
  scheme: https
  tlsConfig:
    insecureSkipVerify: false
    caFile: /etc/ssl/certs/ca-certificates.crt
```

### Advanced Configuration

For production environments, consider this comprehensive setup:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  name: prometheus-production
  namespace: monitoring
spec:
  replicas: 2
  serviceAccountName: prometheus-k8s
  serviceMonitorSelector:
    matchLabels:
      monitoring: prometheus
  ruleSelector:
    matchLabels:
      prometheus: main
  podMonitorSelector:
    matchLabels:
      monitoring: prometheus
  probeSelector:
    matchLabels:
      monitoring: prometheus
  alerting:
    alertmanagers:
      - namespace: monitoring
        name: alertmanager-main
        port: web
        pathPrefix: /alertmanager
  retention: 30d
  retentionSize: 45GB
  storage:
    volumeClaimTemplate:
      spec:
        storageClassName: fast-ssd
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 50Gi
  resources:
    requests:
      memory: 2Gi
      cpu: 1000m
    limits:
      memory: 4Gi
      cpu: 2000m
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
  additionalScrapeConfigs:
    name: additional-scrape-configs
    key: prometheus-additional.yaml
---
apiVersion: monitoring.coreos.com/v1
kind: Alertmanager
metadata:
  name: alertmanager-main
  namespace: monitoring
spec:
  replicas: 3
  alertmanagerConfigSelector:
    matchLabels:
      alertmanager: main
  storage:
    volumeClaimTemplate:
      spec:
        storageClassName: standard
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
  retention: 120h
  resources:
    requests:
      memory: 512Mi
      cpu: 200m
    limits:
      memory: 1Gi
      cpu: 500m
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
```

## Operational Tips

### Common Troubleshooting Commands

Check Prometheus Operator resource status:
```bash
# List all Prometheus instances
kubectl get prometheus -A

# List all Alertmanager instances
kubectl get alertmanager -A

# List all PrometheusRules
kubectl get prometheusrule -A

# Check specific resource status
kubectl describe prometheus prometheus-main -n monitoring
kubectl describe alertmanager alertmanager-main -n monitoring
```

### Debugging Prometheus Issues

**Target discovery problems:**
```bash
# Check Prometheus targets via port-forward
kubectl port-forward svc/prometheus-main 9090:9090 -n monitoring
# Navigate to http://localhost:9090/targets

# Check ServiceMonitor discovery
kubectl get servicemonitor -A

# Check if services have proper labels
kubectl get services -A --show-labels | grep monitor

# Verify Prometheus can reach targets
kubectl exec -it prometheus-prometheus-main-0 -n monitoring -- wget -qO- http://target-service:8080/metrics
```

**Rule loading issues:**
```bash
# Check PrometheusRule resources
kubectl get prometheusrule -A -o yaml

# Verify rule syntax
kubectl get prometheusrule example-rules -n monitoring -o yaml | grep -A 20 "spec:"

# Check Prometheus configuration
kubectl get prometheus prometheus-main -n monitoring -o yaml | grep -A 10 ruleSelector

# Check Prometheus logs for rule errors
kubectl logs prometheus-prometheus-main-0 -n monitoring | grep -i rule
```

**Performance issues:**
```bash
# Monitor resource usage
kubectl top pods -n monitoring

# Check metrics ingestion rate
kubectl port-forward svc/prometheus-main 9090:9090 -n monitoring
# Query: rate(prometheus_tsdb_samples_appended_total[5m])

# Check query performance
# Query: prometheus_engine_query_duration_seconds

# Verify storage usage
kubectl exec -it prometheus-prometheus-main-0 -n monitoring -- df -h /prometheus
```

### Debugging Alertmanager Issues

**Alert routing problems:**
```bash
# Check Alertmanager status
kubectl port-forward svc/alertmanager-main 9093:9093 -n monitoring
# Navigate to http://localhost:9093

# Check AlertmanagerConfig resources
kubectl get alertmanagerconfig -A

# Verify alert routing configuration
kubectl get alertmanager alertmanager-main -n monitoring -o yaml | grep -A 10 alertmanagerConfigSelector

# Check Alertmanager logs
kubectl logs alertmanager-alertmanager-main-0 -n monitoring | grep -i route
```

**Notification failures:**
```bash
# Check receiver configuration
kubectl get alertmanagerconfig -A -o yaml | grep -A 20 receivers

# Test webhook endpoints
kubectl run curl-test --rm -i --tty --image=curlimages/curl -- curl -X POST webhook-url

# Check notification logs
kubectl logs alertmanager-alertmanager-main-0 -n monitoring | grep -i notification

# Verify secret configurations
kubectl get secrets -n monitoring | grep alertmanager
```

### Performance Optimization

#### Prometheus Optimization
- **Reduce scrape frequency** for low-priority targets
- **Use recording rules** to pre-compute expensive queries
- **Implement proper retention policies** to manage storage
- **Configure external storage** for long-term retention
- **Use federation** for multi-cluster setups

#### Alertmanager Optimization
- **Group related alerts** to reduce notification spam
- **Use inhibition rules** to suppress redundant alerts
- **Configure proper repeat intervals** to avoid alert fatigue
- **Implement escalation policies** for critical alerts

### Security Best Practices

```bash
# Check service account permissions
kubectl auth can-i --list --as=system:serviceaccount:monitoring:prometheus-k8s

# Verify RBAC configuration
kubectl get clusterrole prometheus-k8s -o yaml
kubectl get clusterrolebinding prometheus-k8s -o yaml

# Check network policies
kubectl get networkpolicy -n monitoring

# Verify TLS configuration
kubectl get secrets -n monitoring | grep tls
```

## FAQ

### Q: What's the difference between Prometheus and PrometheusAgent?

**A:** Prometheus runs a full server with local storage and alerting capabilities, while PrometheusAgent runs in a lightweight mode that only scrapes metrics and forwards them to remote storage. Use PrometheusAgent for:
- Edge deployments with limited resources
- Centralized metrics storage architectures
- Environments where local storage isn't needed

### Q: How do I configure Prometheus to scrape metrics from a custom application?

**A:** You have several options:
1. **ServiceMonitor**: Create a ServiceMonitor resource that selects your service
2. **PodMonitor**: Create a PodMonitor resource that selects your pods directly
3. **ScrapeConfig**: Create a ScrapeConfig for advanced scraping configurations
4. **Additional scrape configs**: Add static configurations to Prometheus

Choose ServiceMonitor for most Kubernetes applications, ScrapeConfig for external targets.

### Q: Why aren't my alerts firing?

**A:** Check these common issues:
1. **Rule syntax errors**: Verify PrometheusRule YAML syntax
2. **Label selectors**: Ensure Prometheus ruleSelector matches your PrometheusRule labels
3. **Query errors**: Test your PromQL expressions in Prometheus UI
4. **Evaluation interval**: Check if the `for` duration is too long
5. **Alertmanager routing**: Verify alerts reach Alertmanager

### Q: How do I silence alerts temporarily?

**A:** You can silence alerts through:
1. **Alertmanager UI**: Navigate to the silences page and create a new silence
2. **CLI**: Use `amtool` to create silences programmatically
3. **API**: Use the Alertmanager API to create silences
4. **Kubernetes**: Create a silence through AlertmanagerConfig if needed for permanent suppression

### Q: Can I use external Alertmanager instances?

**A:** Yes, configure the `spec.alerting.alertmanagers` field in your Prometheus resource to point to external Alertmanager instances. You can mix internal and external Alertmanagers.

### Q: How do I backup Prometheus data?

**A:** Options for backing up Prometheus data:
1. **Volume snapshots**: Create snapshots of the persistent volume
2. **Remote write**: Configure remote write to backup storage
3. **Thanos or Cortex**: Use long-term storage solutions
4. **Manual backup**: Use `prometheus-dump-tool` or similar utilities

### Q: What's the recommended resource allocation?

**A:** Resource recommendations depend on your scale:
- **Small cluster** (< 100 targets): 2 CPU cores, 4GB RAM, 50GB storage
- **Medium cluster** (100-500 targets): 4 CPU cores, 8GB RAM, 100GB storage  
- **Large cluster** (500+ targets): 8+ CPU cores, 16GB+ RAM, 200GB+ storage

Monitor actual usage and adjust accordingly.

### Q: How do I configure high availability?

**A:** For HA Prometheus setup:
1. **Multiple replicas**: Set `spec.replicas: 2` or higher
2. **External storage**: Use remote write to shared storage
3. **Load balancing**: Use a service to distribute queries
4. **Alertmanager clustering**: Use 3+ Alertmanager replicas
5. **Data consistency**: Consider using Thanos or similar solutions

## Additional Resources

For deeper understanding of Prometheus Operator concepts and advanced configurations:

- **[Prometheus Operator Documentation](https://prometheus-operator.dev/docs/)** - Official operator documentation
- **[Prometheus Documentation](https://prometheus.io/docs/)** - Core Prometheus concepts and configuration
- **[Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)** - Alert routing and notification configuration
- **[PromQL Guide](https://prometheus.io/docs/prometheus/latest/querying/basics/)** - Prometheus query language reference
- **[Monitoring Mixins](https://monitoring.mixins.dev/)** - Pre-built monitoring configurations
- **[Awesome Prometheus](https://github.com/roaldnefs/awesome-prometheus)** - Community resources and tools
- **[Prometheus Operator API Reference](https://doc.crds.dev/github.com/prometheus-operator/prometheus-operator)** - Complete API documentation
- **[Grafana Dashboards](https://grafana.com/dashboards/)** - Pre-built dashboards for Prometheus metrics

### Version Compatibility

| Prometheus Operator | Prometheus | Alertmanager | Kubernetes |
|-------------------|------------|--------------|------------|
| 0.68.x | 2.47.x | 0.26.x | 1.21+ |
| 0.67.x | 2.46.x | 0.25.x | 1.21+ |
| 0.66.x | 2.45.x | 0.25.x | 1.20+ |

Always check the [compatibility matrix](https://github.com/prometheus-operator/prometheus-operator#compatibility) for the latest version support.

---

*This documentation is maintained alongside the platform codebase. When making changes to Prometheus Operator configurations, please update this reference accordingly.*