# Grafana Operator Custom Resources

This page provides a comprehensive reference for the Grafana Operator Custom Resources (CRs) used in our Modern Platform Experience. The Grafana Operator, installed via Operator Lifecycle Manager (OLM), enables declarative management of Grafana instances, dashboards, datasources, and folder organization on Kubernetes.

## Overview

The Grafana Operator manages four primary Custom Resource types that work together to provide a complete observability solution:

### Grafana - Instance Management
The `Grafana` CR defines a Grafana instance deployment. The operator manages the complete lifecycle of the Grafana application, including configuration, persistence, and service exposure.

**Reconciliation Flow:**
1. **Deployment**: Creates Grafana deployment with specified configuration
2. **Service**: Exposes Grafana via Kubernetes service
3. **Configuration**: Applies configuration settings and environment variables
4. **Health Check**: Monitors Grafana instance health and readiness
5. **Update**: Handles configuration changes and rolling updates
6. **Reconcile**: Continuously ensures desired state matches actual state

### GrafanaDashboard - Dashboard Management
The `GrafanaDashboard` CR defines individual dashboard configurations that are automatically imported into target Grafana instances via instance selectors.

**Reconciliation Flow:**
1. **Selection**: Identifies target Grafana instances using `instanceSelector`
2. **Validation**: Validates dashboard JSON structure and syntax
3. **Import**: Imports dashboard into selected Grafana instances
4. **Update**: Handles dashboard modifications and version management
5. **Cleanup**: Removes dashboards when CR is deleted
6. **Reconcile**: Ensures dashboard consistency across instances

### GrafanaDatasource - Datasource Configuration
The `GrafanaDatasource` CR manages datasource connections to various backends like Prometheus, InfluxDB, or Elasticsearch, including authentication and connection settings.

**Reconciliation Flow:**
1. **Selection**: Targets Grafana instances using `instanceSelector`
2. **Configuration**: Sets up datasource connection parameters
3. **Authentication**: Handles credentials and security settings
4. **Testing**: Validates datasource connectivity (if configured)
5. **Plugin Management**: Installs required datasource plugins
6. **Reconcile**: Maintains datasource configuration consistency

### GrafanaFolder - Organization Management
The `GrafanaFolder` CR creates organizational folders within Grafana instances for better dashboard management and access control.

**Reconciliation Flow:**
1. **Selection**: Identifies target Grafana instances
2. **Creation**: Creates folder structure in Grafana
3. **Permissions**: Applies folder-level permissions (if configured)
4. **Organization**: Maintains folder hierarchy
5. **Cleanup**: Removes folders when CR is deleted
6. **Reconcile**: Ensures folder structure consistency

## Field Reference

### Grafana Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `metadata.labels.dashboards` | string | - | Label selector for dashboard targeting | **Required** - Use consistent naming (e.g., `grafana-a`) |
| `metadata.labels.folders` | string | - | Label selector for folder targeting | **Required** - Typically matches dashboard label |
| `spec.config.auth.disable_login_form` | string | `'true'` | Whether to show login form | Use `'false'` for development environments |
| `spec.config.security.admin_user` | string | `admin` | Default admin username | Use `root` for consistency |
| `spec.config.security.admin_password` | string | - | Default admin password | **Required** - Use secure passwords in production |
| `spec.config.log.mode` | string | `console` | Logging output mode | Use `console` for container environments |

### GrafanaDashboard Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `spec.instanceSelector.matchLabels` | object | - | Selector for target Grafana instances | **Required** - Must match Grafana CR labels |
| `spec.json` | string | - | Dashboard JSON definition | **Required** - Use multiline YAML string format |
| `spec.folder` | string | - | Target folder for dashboard placement | Optional - Omit for default folder |
| `spec.datasources` | array | - | Dashboard-specific datasource mappings | Optional - For datasource name overrides |

### GrafanaDatasource Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `spec.instanceSelector.matchLabels` | object | - | Selector for target Grafana instances | **Required** - Must match Grafana CR labels |
| `spec.datasource.name` | string | - | Datasource display name | **Required** - Use descriptive names |
| `spec.datasource.type` | string | - | Datasource type (prometheus, influxdb, etc.) | **Required** - Match data source type |
| `spec.datasource.url` | string | - | Datasource connection URL | **Required** - Use service DNS names in cluster |
| `spec.datasource.access` | string | `proxy` | Access mode (proxy or direct) | **Recommended: `proxy`** for security |
| `spec.datasource.isDefault` | boolean | `false` | Whether this is the default datasource | Use `true` for primary datasource |
| `spec.datasource.jsonData` | object | - | Datasource-specific configuration | Configure timeInterval, TLS settings |
| `spec.plugins` | array | - | Required Grafana plugins | List plugins with name and version |

### GrafanaFolder Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `spec.instanceSelector.matchLabels` | object | - | Selector for target Grafana instances | **Required** - Must match Grafana CR labels |
| `spec.title` | string | - | Folder display name | **Required** - Use descriptive folder names |
| `spec.permissions` | array | - | Folder-level access permissions | Optional - Configure for access control |

## Examples

### Basic Grafana Instance

For development and testing environments:

```yaml
apiVersion: grafana.integreatly.org/v1beta1
kind: Grafana
metadata:
  labels:
    dashboards: grafana-a
    folders: grafana-a
  name: grafana-a
spec:
  config:
    auth:
      disable_login_form: 'false'
    log:
      mode: console
    security:
      admin_user: root
      admin_password: start
```

### Dashboard with Simple Configuration

```yaml
apiVersion: grafana.integreatly.org/v1beta1
kind: GrafanaDashboard
metadata:
  name: grafanadashboard-sample
spec:
  instanceSelector:
    matchLabels:
      dashboards: grafana-a
  json: |
    {
      "title": "Simple Dashboard",
      "timezone": "browser",
      "editable": true,
      "graphTooltip": 1,
      "panels": [],
      "time": { "from": "now-6h", "to": "now" },
      "refresh": "5s",
      "schemaVersion": 17,
      "version": 0
    }
```

### Prometheus Datasource Configuration

```yaml
apiVersion: grafana.integreatly.org/v1beta1
kind: GrafanaDatasource
metadata:
  name: grafanadatasource-sample
spec:
  datasource:
    name: prometheus
    type: prometheus
    url: http://prometheus-service:9090
    access: proxy
    isDefault: true
    jsonData:
      timeInterval: 5s
      tlsSkipVerify: true
  instanceSelector:
    matchLabels:
      dashboards: grafana-a
  plugins:
    - name: grafana-clock-panel
      version: 1.3.0
```

### Organizational Folder

```yaml
apiVersion: grafana.integreatly.org/v1beta1
kind: GrafanaFolder
metadata:
  name: grafanafolder-sample
spec:
  instanceSelector:
    matchLabels:
      dashboards: grafana-a
  title: Example Folder
```

### Production-Ready Configuration

For production environments with enhanced security and monitoring:

```yaml
apiVersion: grafana.integreatly.org/v1beta1
kind: Grafana
metadata:
  labels:
    dashboards: grafana-prod
    folders: grafana-prod
  name: grafana-production
spec:
  config:
    auth:
      disable_login_form: 'true'
      oauth_auto_login: 'true'
    security:
      admin_user: admin
      admin_password: "${GRAFANA_ADMIN_PASSWORD}"
      secret_key: "${GRAFANA_SECRET_KEY}"
    log:
      mode: console
      level: info
    server:
      domain: grafana.company.com
      root_url: https://grafana.company.com
    database:
      type: postgres
      host: postgres-service:5432
      name: grafana
      user: grafana
      password: "${GRAFANA_DB_PASSWORD}"
  deployment:
    spec:
      template:
        spec:
          containers:
          - name: grafana
            resources:
              requests:
                memory: "256Mi"
                cpu: "100m"
              limits:
                memory: "512Mi"
                cpu: "500m"
---
apiVersion: grafana.integreatly.org/v1beta1
kind: GrafanaDatasource
metadata:
  name: prometheus-production
spec:
  datasource:
    name: Prometheus Production
    type: prometheus
    url: http://prometheus-server:9090
    access: proxy
    isDefault: true
    jsonData:
      timeInterval: 15s
      tlsSkipVerify: false
      httpMethod: POST
      queryTimeout: 60s
  instanceSelector:
    matchLabels:
      dashboards: grafana-prod
```

## Operational Tips

### Common Troubleshooting Commands

**Check Grafana Operator status:**
```bash
# Verify operator deployment
kubectl get deployment grafana-operator -n operators

# Check operator logs
kubectl logs deployment/grafana-operator -n operators

# List all Grafana CRs
kubectl get grafana,grafanadashboard,grafanadatasource,grafanafolder -A
```

**Monitor Grafana instance status:**
```bash
# Check Grafana instance
kubectl get grafana grafana-a -o yaml

# Verify Grafana pod status
kubectl get pods -l app=grafana-a

# Check Grafana service
kubectl get svc -l app=grafana-a
```

### Debugging Dashboard Issues

**Pending dashboard imports:**
```bash
# Check dashboard status
kubectl describe grafanadashboard grafanadashboard-sample

# View dashboard events
kubectl get events --field-selector involvedObject.name=grafanadashboard-sample

# Check instance selector matching
kubectl get grafana -l dashboards=grafana-a --show-labels
```

**Common dashboard issues:**
- **Import failed**: Verify JSON syntax using online JSON validators
- **No target instances**: Check `instanceSelector` matches Grafana labels exactly
- **Permission denied**: Ensure Grafana operator has required RBAC permissions
- **Plugin missing**: Add required plugins to datasource spec or install manually

### Debugging Datasource Issues

**Failed datasource tests:**
```bash
# Check datasource status
kubectl describe grafanadatasource grafanadatasource-sample

# Test datasource connectivity from Grafana pod
kubectl exec -n default deployment/grafana-a -- curl -f http://prometheus-service:9090/api/v1/status/config

# Check datasource configuration in Grafana UI
# Navigate to Configuration > Datasources
```

**Common datasource issues:**
- **Connection refused**: Verify target service is running and accessible
- **Authentication failed**: Check credentials and authentication method
- **Plugin not found**: Ensure required datasource plugins are installed
- **TLS errors**: Configure `tlsSkipVerify` appropriately for environment

### Plugin Management

**Installing additional plugins:**
```bash
# Check available plugins
kubectl exec -n default deployment/grafana-a -- grafana-cli plugins list-remote

# Install plugin manually (not persistent)
kubectl exec -n default deployment/grafana-a -- grafana-cli plugins install grafana-piechart-panel

# For persistent plugins, add to datasource or dashboard specs
```

### Performance Optimization

- **Resource limits**: Set appropriate CPU/memory limits for Grafana pods
- **Dashboard optimization**: Limit panel count and query complexity
- **Datasource tuning**: Configure appropriate query timeouts and intervals
- **Cache settings**: Enable query result caching for frequently accessed dashboards

### Backup and Recovery

**Dashboard backup:**
```bash
# Export all dashboards via API
kubectl port-forward svc/grafana-a 3000:3000
curl -H "Authorization: Bearer $API_TOKEN" http://localhost:3000/api/search?type=dash-db

# Backup dashboard CRs
kubectl get grafanadashboard -o yaml > dashboard-backup.yaml
```

**Configuration backup:**
```bash
# Backup all Grafana CRs
kubectl get grafana,grafanadatasource,grafanafolder -o yaml > grafana-config-backup.yaml
```

## FAQ

### Q: How do I access the Grafana UI?

**A:** Use port-forwarding to access Grafana locally:
```bash
kubectl port-forward svc/grafana-a 3000:3000
```
Then navigate to `http://localhost:3000` and login with the configured admin credentials.

### Q: Why isn't my dashboard appearing in Grafana?

**A:** Check these common issues:
1. Verify `instanceSelector` matches the Grafana instance labels exactly
2. Ensure the dashboard JSON is valid (test with online JSON validator)
3. Check if the target folder exists (create GrafanaFolder CR if needed)
4. Review Grafana operator logs for import errors

### Q: How do I handle secrets in datasource configurations?

**A:** Use Kubernetes secrets and reference them in your datasource configuration:
```yaml
spec:
  datasource:
    secureJsonData:
      httpHeaderValue1: "${SECRET_VALUE}"
```
The operator supports environment variable substitution from secrets.

### Q: Can I use multiple Grafana instances in the same cluster?

**A:** Yes, use different label selectors for each instance:
```yaml
# Instance 1
metadata:
  labels:
    dashboards: grafana-dev
    
# Instance 2  
metadata:
  labels:
    dashboards: grafana-staging
```

### Q: How do I upgrade the Grafana Operator?

**A:** The operator is managed via OLM subscription. Check the subscription configuration:
```bash
# Check current version
kubectl get subscription grafana-subscription -n operators -o yaml

# Update channel if needed
kubectl patch subscription grafana-subscription -n operators --type='merge' -p='{"spec":{"channel":"v5"}}'
```

### Q: What happens if I delete a GrafanaDashboard CR?

**A:** The operator will automatically remove the dashboard from all target Grafana instances. This operation is not reversible, so ensure you have backups of important dashboards.

### Q: How do I troubleshoot plugin installation issues?

**A:** Check these areas:
1. Verify plugin name and version in the datasource spec
2. Check Grafana pod logs for plugin installation errors
3. Ensure the Grafana instance has internet access (for plugin downloads)
4. Consider using init containers for offline plugin installation

### Q: Can I customize the Grafana deployment (resources, replicas, etc.)?

**A:** Yes, use the `deployment` spec in your Grafana CR:
```yaml
spec:
  deployment:
    spec:
      replicas: 2
      template:
        spec:
          containers:
          - name: grafana
            resources:
              requests:
                memory: "256Mi"
                cpu: "100m"
```

## Additional Resources

For deeper understanding of Grafana Operator concepts and advanced configurations:

- **[Grafana Operator Documentation](https://grafana-operator.github.io/grafana-operator/)** - Official operator documentation
- **[Grafana Operator API Reference](https://grafana-operator.github.io/grafana-operator/docs/api/)** - Complete API documentation
- **[Grafana Configuration Reference](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/)** - Grafana configuration options
- **[OLM Documentation](https://olm.operatorframework.io/)** - Operator Lifecycle Manager docs
- **[Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/best-practices/)** - Dashboard design guidelines
- **[Prometheus Integration](https://grafana.com/docs/grafana/latest/datasources/prometheus/)** - Prometheus datasource configuration

### Version Matrix

| Platform Version | Grafana Operator Channel | Grafana Version | Supported Features |
|------------------|-------------------------|-----------------|-------------------|
| 1.1.x | v5 | 9.x | All CRs, Plugin management |
| 1.0.x | v4 | 8.x | Basic CRs, Limited plugin support |

---

*This documentation is maintained alongside the platform codebase. When making changes to Grafana configurations, please update this reference accordingly.*