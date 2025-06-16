# Observability Stack

The observability stack provides comprehensive monitoring, metrics collection, and visualization capabilities for your Kubernetes platform. It includes Prometheus for metrics, Grafana for dashboards, and Loki for log aggregation.

## Overview

The observability stack enables you to:

- **Monitor cluster health** - Track resource usage, performance metrics, and system health
- **Visualize data** - Create custom dashboards and alerts in Grafana
- **Aggregate logs** - Centralize log collection and analysis with Loki
- **Set up alerting** - Configure proactive alerts for system issues

## Key Components

### Prometheus Operator
Manages Prometheus instances and related resources like ServiceMonitors and PrometheusRules.

### Grafana Operator
Deploys and manages Grafana instances with automated dashboard and datasource management.

### Loki Operator
Provides log aggregation capabilities with efficient storage and querying.

## Documentation Sections

- **[Prometheus Operator CRs](prometheus-operator-crs.md)** - Custom resources for metrics collection and alerting
- **[Grafana Operator CRs](grafana-operator-crs.md)** - Dashboard and visualization management

## Getting Started

To work with the observability stack:

1. Understand the overall [Architecture](../architecture.md) and how observability fits in
2. Review the operator-specific custom resource documentation
3. Check the [Development Guide](../development.md) for local testing approaches
4. Consult the [Troubleshooting Guide](../troubleshooting.md) for common issues

## Monitoring Best Practices

### Metrics Strategy
- **Golden signals** - Monitor latency, traffic, errors, and saturation
- **SLI/SLO definitions** - Define service level indicators and objectives
- **Alert fatigue** - Avoid over-alerting with proper thresholds

### Dashboard Design
- **User-focused** - Design dashboards for specific user personas
- **Actionable insights** - Include contextual information for troubleshooting
- **Performance** - Optimize queries to reduce dashboard load times

### Log Management
- **Structured logging** - Use consistent log formats across applications
- **Log levels** - Implement appropriate log level hierarchies
- **Retention policies** - Balance storage costs with audit requirements

## Quick Links

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [Observability Best Practices](https://sre.google/sre-book/monitoring-distributed-systems/)