# API Reference

This document provides technical reference information for the Platform CDK8s API, including class definitions, interfaces, and usage examples.

## Overview

The Platform CDK8s project exposes a TypeScript API that can be consumed as an NPM package. The primary export is the `Platform` class, which extends the CDK8s `Chart` class and provides a comprehensive platform deployment.

## Installation

```bash
# Configure npm to use GitHub Packages
npm config set @containerly:registry https://npm.pkg.github.com

# Install the package
npm install @containerly/platform
```

## Primary API

### Platform Class

The main class that defines the platform deployment.

```typescript
export class Platform extends Chart {
  constructor(scope: Construct, id: string, props?: ChartProps)
}
```

#### Parameters

- **scope** (`Construct`): The parent construct
- **id** (`string`): Unique identifier for this platform instance
- **props** (`ChartProps`, optional): Configuration properties

#### Example Usage

```typescript
import { Platform } from '@containerly/platform';
import { App } from 'cdk8s';

const app = new App();
new Platform(app, 'my-platform', {
  // Optional configuration
  namespace: 'custom-namespace'
});
app.synth();
```

#### Generated Resources

The Platform class creates the following Kubernetes resources:

##### Namespaces

- **operators**: General operator deployment namespace
- **flux-system**: Dedicated namespace for Flux operator

##### Operator Groups

- **flux-operator-group**: Targets flux-system namespace
- **prometheus-operator-group**: Targets default namespace

##### Operator Subscriptions

| Operator | Package Name | Channel | Namespace | Description |
|----------|--------------|---------|-----------|-------------|
| Flux | flux | stable | flux-system | GitOps continuous delivery |
| Grafana | grafana-operator | v5 | operators | Monitoring dashboards |
| Prometheus | prometheus | beta | operators | Metrics collection |
| Loki | loki-operator | alpha | operators | Log aggregation |
| Strimzi Kafka | strimzi-kafka-operator | stable | operators | Apache Kafka |
| MinIO | minio-operator | stable | operators | Object storage |
| Elastic ECK | elastic-cloud-eck | stable | operators | Elasticsearch stack |

## Configuration Interfaces

### ChartProps

Extended from CDK8s ChartProps interface.

```typescript
interface ChartProps {
  /**
   * The default namespace for all resources defined in this chart.
   * @default - no namespace is synthesized (usually this implies "default")
   */
  readonly namespace?: string;

  /**
   * Labels to apply to all resources defined in this chart.
   * @default - no labels
   */
  readonly labels?: { [key: string]: string };

  /**
   * Annotations to apply to all resources defined in this chart.
   * @default - no annotations
   */
  readonly annotations?: { [key: string]: string };
}
```

### Platform Configuration

Currently, the Platform class uses fixed configuration. Future versions may support custom configuration through props.

## Resource Specifications

### Subscription Specifications

Each operator subscription follows this pattern:

```typescript
new Subscription(scope, id, {
  metadata: {
    name: string;
    namespace: string;
  },
  spec: {
    channel: string;
    name: string;
    source: string;
    sourceNamespace: string;
    installPlanApproval?: 'Automatic' | 'Manual';
  }
});
```

#### Flux Subscription

```typescript
new Subscription(this, 'flux-subscription', {
  metadata: {
    name: 'flux-subscription',
    namespace: 'flux-system',
  },
  spec: {
    channel: 'stable',
    installPlanApproval: 'Automatic',
    name: 'flux',
    source: 'operatorhubio-catalog',
    sourceNamespace: 'olm',
  },
});
```

#### Grafana Subscription

```typescript
new Subscription(this, 'grafana-subscription', {
  metadata: {
    name: 'grafana-subscription',
    namespace: 'operators',
  },
  spec: {
    channel: 'v5',
    name: 'grafana-operator',
    source: 'operatorhubio-catalog',
    sourceNamespace: 'olm',
  },
});
```

#### Prometheus Subscription

```typescript
new Subscription(this, 'prometheus-subscription', {
  metadata: {
    name: 'prometheus-subscription',
    namespace: 'operators',
  },
  spec: {
    channel: 'beta',
    installPlanApproval: 'Automatic',
    name: 'prometheus',
    source: 'operatorhubio-catalog',
    sourceNamespace: 'olm',
  },
});
```

#### Loki Subscription

```typescript
new Subscription(this, 'loki-subscription', {
  metadata: {
    name: 'loki-operator',
    namespace: 'operators',
  },
  spec: {
    channel: 'alpha',
    name: 'loki-operator',
    source: 'operatorhubio-catalog',
    sourceNamespace: 'olm',
  },
});
```

#### Strimzi Kafka Subscription

```typescript
new Subscription(this, 'strimzi-kafka-subscription', {
  metadata: {
    name: 'strimzi-kafka-operator',
    namespace: 'operators',
  },
  spec: {
    channel: 'stable',
    name: 'strimzi-kafka-operator',
    source: 'operatorhubio-catalog',
    sourceNamespace: 'olm',
  },
});
```

#### MinIO Subscription

```typescript
new Subscription(this, 'minio-subscription', {
  metadata: {
    name: 'minio-operator',
    namespace: 'operators',
  },
  spec: {
    channel: 'stable',
    name: 'minio-operator',
    source: 'operatorhubio-catalog',
    sourceNamespace: 'olm',
  },
});
```

#### Elastic Cloud ECK Subscription

```typescript
new Subscription(this, 'elastic-cloud-eck-subscription', {
  metadata: {
    name: 'my-elastic-cloud-eck',
    namespace: 'operators',
  },
  spec: {
    channel: 'stable',
    name: 'elastic-cloud-eck',
    source: 'operatorhubio-catalog',
    sourceNamespace: 'olm',
  },
});
```

### OperatorGroup Specifications

#### Flux Operator Group

```typescript
new OperatorGroup(this, 'flux-operator-group', {
  metadata: {
    name: 'flux-operator-group',
    namespace: 'flux-system',
  },
  spec: {
    targetNamespaces: ['flux-system'],
  },
});
```

#### Prometheus Operator Group

```typescript
new OperatorGroup(this, 'prometheus-operator-group', {
  metadata: {
    name: 'prometheus-operator-group',
    namespace: 'default',
  },
  spec: {
    targetNamespaces: ['default'],
  },
});
```

### Namespace Specifications

#### Flux System Namespace

```typescript
new Namespace(this, 'flux-system', {
  metadata: {
    name: 'flux-system',
  },
});
```

## Imported Types

The Platform class uses types imported from CDK8s and generated OLM definitions:

### CDK8s Core Types

```typescript
import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import { Namespace } from 'cdk8s-plus-29';
```

### OLM Types

```typescript
import { 
  OperatorGroup, 
  Subscription 
} from './imports/operators.coreos.com';
```

## Usage Patterns

### Basic Usage

```typescript
import { Platform } from '@containerly/platform';
import { App } from 'cdk8s';

// Create application
const app = new App();

// Create platform with default configuration
new Platform(app, 'platform');

// Synthesize manifests
app.synth();
```

### Custom Configuration

```typescript
import { Platform } from '@containerly/platform';
import { App } from 'cdk8s';

const app = new App();

// Create platform with custom properties
new Platform(app, 'platform', {
  labels: {
    'app.kubernetes.io/managed-by': 'platform-cdk8s',
    'app.kubernetes.io/version': '1.0.0',
  },
  annotations: {
    'deployment.kubernetes.io/revision': '1',
  },
});

app.synth();
```

### Multiple Platform Instances

```typescript
import { Platform } from '@containerly/platform';
import { App } from 'cdk8s';

const app = new App();

// Development platform
new Platform(app, 'platform-dev', {
  labels: { environment: 'development' },
});

// Staging platform
new Platform(app, 'platform-staging', {
  labels: { environment: 'staging' },
});

app.synth();
```

## Output Manifest Structure

The generated manifest (`dist/platform.k8s.yaml`) contains resources in this order:

1. **Namespace Resources**
   - flux-system namespace

2. **OperatorGroup Resources**
   - flux-operator-group
   - prometheus-operator-group

3. **Subscription Resources**
   - flux-subscription
   - grafana-subscription
   - prometheus-subscription
   - loki-subscription
   - strimzi-kafka-subscription
   - minio-subscription
   - elastic-cloud-eck-subscription

## Versioning and Compatibility

### Semantic Versioning

The platform follows semantic versioning:

- **Major** (X.0.0): Breaking changes to API or resource definitions
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, backward compatible

### CDK8s Compatibility

| Platform Version | CDK8s Version | Node.js Version |
|-------------------|---------------|-----------------|
| 1.x.x | ^2.69.73 | 18.x, 20.x |

### Kubernetes Compatibility

| Platform Version | Kubernetes Version | OLM Version |
|-------------------|-------------------|-------------|
| 1.x.x | 1.20+ | 0.20+ |

## Error Handling

### Common Error Scenarios

#### Missing OLM

```typescript
// Error: OLM CRDs not found
// Solution: Install OLM before applying platform manifests
```

#### Namespace Conflicts

```typescript
// Error: Namespace already exists
// Solution: Platform creates namespaces if they don't exist
```

#### Resource Quotas

```typescript
// Error: Resource quota exceeded
// Solution: Increase quotas or adjust resource requests
```

## Testing API

### Unit Testing

```typescript
import { Platform } from '@containerly/platform';
import { Testing } from 'cdk8s';

describe('Platform', () => {
  test('Should create all required resources', () => {
    const app = Testing.app();
    const chart = new Platform(app, 'test-platform');
    const results = Testing.synth(chart);
    
    // Test for specific resources
    expect(results).toContainEqual(
      expect.objectContaining({
        kind: 'Namespace',
        metadata: expect.objectContaining({
          name: 'flux-system'
        })
      })
    );
  });
});
```

### Integration Testing

```typescript
import { Platform } from '@containerly/platform';
import { App } from 'cdk8s';
import * as fs from 'fs';

describe('Platform Integration', () => {
  test('Should generate valid Kubernetes manifest', () => {
    const app = new App({ outdir: 'test-output' });
    new Platform(app, 'test-platform');
    app.synth();
    
    // Verify manifest file exists
    expect(fs.existsSync('test-output/test-platform.k8s.yaml')).toBe(true);
    
    // Parse and validate YAML
    const manifest = fs.readFileSync('test-output/test-platform.k8s.yaml', 'utf8');
    expect(() => YAML.parse(manifest)).not.toThrow();
  });
});
```

## Advanced Usage

### Extending the Platform

```typescript
import { Platform } from '@containerly/platform';
import { Chart, ChartProps } from 'cdk8s';
import { Construct } from 'constructs';

export class ExtendedPlatform extends Platform {
  constructor(scope: Construct, id: string, props?: ChartProps) {
    super(scope, id, props);
    
    // Add custom resources
    this.addCustomOperator();
  }
  
  private addCustomOperator(): void {
    // Custom operator implementation
  }
}
```

### Custom Resource Definitions

After operators are installed, you can create custom resources:

```typescript
import { Platform } from '@containerly/platform';
import { App } from 'cdk8s';
// Import custom resource types after running `cdk8s import`

const app = new App();
const platform = new Platform(app, 'platform');

// Add custom resources after platform deployment
// Note: This requires the operators to be installed first
```

## Migration Guide

### From Version 0.x to 1.x

No breaking changes in API. The Platform constructor signature remains the same.

### Future Versions

Breaking changes will be documented in release notes with migration instructions.

## Performance Considerations

### Resource Usage

Default resource requests per operator:
- CPU: 100-500m
- Memory: 128-512Mi

### Scaling

The platform scales automatically based on operator requirements. Monitor resource usage and adjust cluster capacity as needed.

## Security Considerations

### RBAC

All operators receive minimal required permissions through OLM-managed RBAC.

### Network Policies

Consider implementing network policies to isolate operator traffic:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: operator-network-policy
  namespace: operators
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  egress:
  - {}  # Allow all egress (customize as needed)
```

## Troubleshooting API Issues

### Import Errors

```bash
# Regenerate CDK8s imports
npm run import
```

### Type Errors

```bash
# Check CDK8s version compatibility
npm list cdk8s
npm run upgrade
```

### Runtime Errors

```bash
# Check generated manifests
cat dist/platform.k8s.yaml
kubectl apply --dry-run=server -f dist/platform.k8s.yaml
```

## Support and Contributions

For API-related issues:

1. Check the [Troubleshooting](troubleshooting.md) guide
2. Review [GitHub Issues](https://github.com/containerly/platform/issues)
3. Consult the [Contributing](contributing.md) guide for code contributions

## Changelog

### Version 1.0.0

- Initial release with core operator subscriptions
- Support for Flux, Grafana, Prometheus, Loki, Strimzi Kafka, MinIO, and Elastic ECK
- Automated CI/CD pipeline with semantic versioning
- Comprehensive documentation and testing

Future versions will include API changes and new features in this section.