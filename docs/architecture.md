# Architecture

This document provides a comprehensive overview of the Platform CDK8s architecture, design decisions, and component interactions.

## System Overview

The Platform CDK8s project implements a comprehensive Kubernetes platform using the Infrastructure as Code (IaC) approach with CDK8s. The system generates Kubernetes manifests that deploy and configure multiple operators for observability, messaging, storage, and GitOps workflows.

## Design Principles

### Infrastructure as Code
All platform components are defined as TypeScript code using CDK8s constructs, enabling:
- Version control of infrastructure definitions
- Code review processes for infrastructure changes
- Reproducible deployments across environments
- Type safety and compile-time validation

### Operator-Based Architecture
The platform leverages Kubernetes operators for component lifecycle management:
- Consistent installation and upgrade procedures
- Automated operational tasks
- Custom resource definitions for configuration
- Operator Lifecycle Manager (OLM) for operator management

### GitOps Workflow
Flux operator provides GitOps capabilities:
- Declarative configuration management
- Automated synchronization with Git repositories
- Rollback capabilities for failed deployments
- Audit trail of all changes

## Core Components

### CDK8s Framework

The platform is built using CDK8s (Cloud Development Kit for Kubernetes):

```typescript
export class Platform extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);
    // Component definitions
  }
}
```

**Benefits:**
- Type-safe infrastructure definitions
- Reusable constructs and patterns
- Integration with existing TypeScript tooling
- Generate standard Kubernetes YAML manifests

### Operator Lifecycle Manager (OLM)

OLM manages the lifecycle of all operators in the platform:

**Components:**
- **Catalog Sources** - Repository of available operators
- **Subscriptions** - Desired operator installations
- **Install Plans** - Execution plans for operator installation
- **Cluster Service Versions (CSV)** - Operator metadata and permissions

**Workflow:**
1. Subscription defines desired operator and channel
2. OLM creates install plan based on subscription
3. Install plan deploys operator and required resources
4. Operator becomes available for managing custom resources

## Platform Components

### Observability Stack

#### Prometheus
- **Purpose**: Metrics collection and alerting
- **Channel**: beta
- **Namespace**: operators
- **Custom Resources**: PrometheusRule, ServiceMonitor, Alertmanager

#### Grafana
- **Purpose**: Visualization and dashboards
- **Channel**: v5
- **Namespace**: operators
- **Custom Resources**: Grafana, GrafanaDashboard, GrafanaDataSource

#### Loki
- **Purpose**: Log aggregation and querying
- **Channel**: alpha (early access)
- **Namespace**: operators
- **Custom Resources**: LokiStack, LoggingRule

### GitOps and Deployment

#### Flux
- **Purpose**: GitOps continuous delivery
- **Channel**: stable
- **Namespace**: flux-system (dedicated namespace)
- **Custom Resources**: GitRepository, Kustomization, HelmRelease

### Messaging and Streaming

#### Strimzi Kafka
- **Purpose**: Apache Kafka event streaming
- **Channel**: stable
- **Namespace**: operators
- **Custom Resources**: Kafka, KafkaTopic, KafkaUser, KafkaConnect

### Storage

#### MinIO
- **Purpose**: Object storage compatible with S3 API
- **Channel**: stable
- **Namespace**: operators
- **Custom Resources**: MinIOInstance, MinIOJob

### Search and Analytics

#### Elastic Cloud ECK
- **Purpose**: Elasticsearch, Kibana, and APM
- **Channel**: stable
- **Namespace**: operators
- **Custom Resources**: Elasticsearch, Kibana, Beat, ElasticMapsServer

## Namespace Organization

### Operator Deployment Strategy

The platform uses a multi-namespace approach:

```
operators/          # Most operators deployed here
├── grafana-operator
├── prometheus-operator
├── loki-operator
├── strimzi-kafka-operator
├── minio-operator
└── elastic-cloud-eck-operator

flux-system/        # Flux has dedicated namespace
├── flux-operator
└── flux-configurations

default/            # Prometheus operator group targets default
└── prometheus-operator-group
```

### Namespace Benefits

- **Isolation**: Operators are isolated from workloads
- **Security**: RBAC can be applied at namespace level
- **Organization**: Clear separation of concerns
- **Scaling**: Easier to manage operator permissions

## Configuration Management

### Operator Subscriptions

Each operator is configured via OLM Subscription:

```typescript
new Subscription(this, 'operator-subscription', {
  metadata: {
    name: 'operator-name',
    namespace: 'operators',
  },
  spec: {
    channel: 'stable',           // Release channel
    name: 'operator-package',    // Package name in catalog
    source: 'operatorhubio-catalog',
    sourceNamespace: 'olm',      // OLM catalog namespace
    installPlanApproval: 'Automatic', // Upgrade strategy
  },
});
```

### Channel Strategy

Different operators use different channels based on stability requirements:

- **stable**: Production-ready releases (Flux, Strimzi, MinIO, ECK)
- **beta**: Feature-complete but newer (Prometheus)
- **v5**: Version-specific channel (Grafana)
- **alpha**: Early access features (Loki)

## Build and Deployment Pipeline

### CI/CD Architecture

```
Developer → Git Push → GitHub Actions → Package Registry → Deployment
     ↓                       ↓                ↓              ↓
  Local Dev              CI Pipeline     NPM Package    Kubernetes
```

### Pipeline Stages

1. **Continuous Integration** (`ci.yml`)
   - Multi-version Node.js testing (18.x, 20.x)
   - TypeScript compilation
   - Test execution
   - Manifest generation
   - Artifact upload

2. **Pull Request Validation** (`pr.yml`)
   - Single Node.js version (20.x)
   - Full validation pipeline
   - Manifest validation
   - PR artifact generation

3. **Release Pipeline** (`release.yml`)
   - Semantic version calculation
   - Package publication to GitHub Packages
   - GitHub release creation
   - Manifest attachment

### Semantic Versioning

Version bumps are determined by commit message conventions:

- `feat!:` or `BREAKING CHANGE:` → Major version (1.0.0 → 2.0.0)
- `feat:` or `[minor]` → Minor version (1.0.0 → 1.1.0)
- `fix:` or `[patch]` → Patch version (1.0.0 → 1.0.1)
- Other commits → Patch version (default)

## Security Considerations

### Operator Permissions

Each operator receives minimal required permissions:
- Operators run in dedicated namespaces
- RBAC rules limit cross-namespace access
- Service accounts follow principle of least privilege

### Supply Chain Security

- All operators sourced from verified OperatorHub catalog
- Manifest generation happens in controlled CI environment
- Package signing via GitHub Packages
- Reproducible builds with locked dependencies

### Network Security

- Default network policies can be applied per namespace
- Operators communicate via Kubernetes service discovery
- TLS encryption available for inter-service communication

## Extensibility

### Adding New Operators

To add a new operator to the platform:

1. **Create subscription** in `main.ts`
2. **Add namespace** if needed
3. **Update operator group** if required
4. **Add tests** for new components
5. **Update documentation**

### Custom Resources

After operators are installed, custom resources can be managed:

1. **Import CRD types** using `cdk8s import`
2. **Define custom resources** in platform code
3. **Configure operator-specific settings**
4. **Test resource creation and management**

### Configuration Patterns

Common patterns for operator configuration:

```typescript
// Pattern 1: Basic subscription
new Subscription(this, 'operator', { /* config */ });

// Pattern 2: Subscription with custom namespace
const namespace = new Namespace(this, 'custom-ns', { /* config */ });
new Subscription(this, 'operator', { 
  metadata: { namespace: namespace.name }
});

// Pattern 3: Operator group for namespace targeting
new OperatorGroup(this, 'operator-group', {
  spec: { targetNamespaces: ['target-ns'] }
});
```

## Performance Considerations

### Resource Requirements

Typical resource usage per operator:
- CPU: 100-500m per operator
- Memory: 128-512Mi per operator
- Storage: Varies by operator (Loki, Elasticsearch require more)

### Scaling Recommendations

- Start with small resource allocations
- Monitor actual usage patterns
- Scale based on workload requirements
- Consider node affinity for critical operators

## Disaster Recovery

### Backup Strategy

- Git repository contains all infrastructure definitions
- Generated manifests are stored in release artifacts
- Operator configurations are declarative and reproducible

### Recovery Procedures

1. **Restore from Git**: Re-deploy platform from repository
2. **Manifest Recovery**: Use released manifest files
3. **Operator Data**: Follow operator-specific backup procedures
4. **Configuration Restore**: Re-apply custom resource configurations

## Monitoring and Observability

### Platform Health

Monitor platform health through:
- Operator deployment status
- Subscription install plan status
- Custom resource creation success
- Generated manifest validation

### Metrics Collection

Key metrics to monitor:
- Operator memory and CPU usage
- Custom resource reconciliation times
- Failed deployments and rollbacks
- Platform component availability

## Migration and Upgrades

### Operator Upgrades

Operators upgrade automatically based on subscription configuration:
- `installPlanApproval: Automatic` enables automatic upgrades
- Channel changes require subscription updates
- Breaking changes may require manual intervention

### Platform Migration

To migrate between environments:
1. Export current custom resource configurations
2. Deploy platform to new environment
3. Import custom resource configurations
4. Validate platform functionality

### Version Compatibility

- CDK8s version compatibility with Kubernetes versions
- Operator version compatibility matrices
- Custom resource API version support