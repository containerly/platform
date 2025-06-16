# Strimzi Kafka Operator Custom Resources

This page provides a comprehensive reference for the Strimzi Kafka Operator Custom Resources (CRs) used in our Modern Platform Experience. The Strimzi Kafka Operator, sourced from OperatorHub.io and installed via Operator Lifecycle Manager (OLM), enables declarative management of Apache Kafka clusters and related services on Kubernetes using GitOps-friendly manifests.

## Overview

Strimzi operates on a comprehensive reconciliation model that manages the entire Kafka ecosystem through seven primary Custom Resource types that work together to provide a complete messaging platform:

### Kafka - Cluster Management
The `Kafka` CR defines the core Kafka cluster deployment. The operator manages the complete lifecycle of Kafka brokers, ZooKeeper ensemble (or KRaft mode), and essential cluster services including entity operators.

**Reconciliation Flow:**
1. **Cluster Setup**: Creates Kafka and ZooKeeper/KRaft cluster configurations
2. **Broker Deployment**: Deploys Kafka broker pods with specified configurations
3. **Service Exposure**: Creates services for internal and external cluster access
4. **Entity Operators**: Deploys Topic and User operators for CR management
5. **Rolling Updates**: Handles configuration changes and version upgrades
6. **Reconcile**: Continuously ensures desired cluster state matches actual state

### KafkaNodePool - Node Management  
The `KafkaNodePool` CR defines groups of Kafka nodes with specific roles and configurations. This enables fine-grained control over node allocation, storage, and scaling for different cluster functions.

**Reconciliation Flow:**
1. **Node Allocation**: Creates Kafka nodes with specified roles (broker, controller)
2. **Storage Management**: Configures persistent storage for each node pool
3. **Resource Assignment**: Applies CPU, memory, and other resource constraints
4. **Scaling Operations**: Handles node pool scaling and rebalancing
5. **Role Management**: Ensures proper distribution of broker and controller roles
6. **Reconcile**: Maintains consistent node pool configuration

### KafkaConnect - Connect Runtime
The `KafkaConnect` CR manages Kafka Connect clusters for data integration pipelines. It provides a scalable, fault-tolerant platform for streaming data between Kafka and external systems.

**Reconciliation Flow:**
1. **Connect Cluster**: Deploys Kafka Connect worker nodes
2. **Plugin Management**: Installs and manages connector plugins
3. **Configuration**: Sets up cluster-wide Connect configuration
4. **Service Exposure**: Creates REST API endpoints for connector management
5. **Scaling**: Handles Connect cluster scaling and load distribution
6. **Reconcile**: Ensures Connect cluster health and configuration consistency

### KafkaBridge - HTTP Bridge
The `KafkaBridge` CR provides an HTTP REST interface to Kafka clusters, enabling applications to produce and consume messages via HTTP APIs without native Kafka client libraries.

**Reconciliation Flow:**
1. **Bridge Deployment**: Creates HTTP-to-Kafka bridge service
2. **Endpoint Configuration**: Sets up REST API endpoints for producers and consumers  
3. **Connection Management**: Establishes connections to target Kafka cluster
4. **Security Integration**: Applies authentication and authorization settings
5. **Load Balancing**: Distributes HTTP requests across bridge instances
6. **Reconcile**: Maintains bridge service availability and configuration

### KafkaTopic - Topic Management
The `KafkaTopic` CR defines individual Kafka topics with their configuration. The Topic Operator ensures topics are created, configured, and maintained according to the CR specifications.

**Reconciliation Flow:**
1. **Topic Creation**: Creates topics in the target Kafka cluster
2. **Configuration Sync**: Applies topic-specific configuration settings
3. **Partition Management**: Handles partition count and replica assignments
4. **Configuration Updates**: Manages topic configuration changes
5. **Cleanup**: Handles topic deletion when CR is removed
6. **Reconcile**: Ensures topic state matches CR specifications

### KafkaUser - User Management
The `KafkaUser` CR manages Kafka users with authentication and authorization settings. The User Operator creates users, manages credentials, and applies ACL rules for fine-grained access control.

**Reconciliation Flow:**
1. **User Creation**: Creates Kafka users with specified authentication type
2. **Credential Management**: Generates and manages user certificates or SCRAM credentials
3. **ACL Application**: Applies authorization rules and access control lists
4. **Secret Management**: Creates Kubernetes secrets with user credentials
5. **Permission Updates**: Handles changes to user permissions and ACLs
6. **Reconcile**: Maintains user authentication and authorization state

### KafkaConnector - Connector Management
The `KafkaConnector` CR defines individual connector instances within a KafkaConnect cluster. Each connector represents a data pipeline between Kafka and external systems.

**Reconciliation Flow:**
1. **Connector Deployment**: Creates connector instances in Connect cluster
2. **Configuration Management**: Applies connector-specific configuration
3. **Task Distribution**: Manages connector task allocation across workers
4. **Status Monitoring**: Tracks connector and task execution status
5. **Failure Handling**: Manages connector restarts and error recovery
6. **Reconcile**: Ensures connector configuration and operational state

## Field Reference

### Kafka Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `metadata.annotations."strimzi.io/node-pools"` | string | - | Enable node pool support | **Required: `enabled`** for modern deployments |
| `metadata.annotations."strimzi.io/kraft"` | string | - | Enable KRaft mode (ZooKeeper-less) | **Recommended: `enabled`** for new clusters |
| `spec.kafka.version` | string | - | Kafka version to deploy | **Required** - Use `4.0.0` for latest features |
| `spec.kafka.metadataVersion` | string | - | Kafka metadata version for KRaft | Use `4.0-IV3` with Kafka 4.0.0 |
| `spec.kafka.listeners` | array | - | Kafka listener configurations | **Required** - Define internal/external access |
| `spec.kafka.config` | object | - | Kafka broker configuration | Set replication factors and ISR settings |
| `spec.entityOperator.topicOperator` | object | `{}` | Topic operator configuration | **Recommended** - Enable for CR-based topic management |
| `spec.entityOperator.userOperator` | object | `{}` | User operator configuration | **Recommended** - Enable for CR-based user management |

### KafkaNodePool Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `metadata.labels."strimzi.io/cluster"` | string | - | Target Kafka cluster name | **Required** - Must match Kafka CR name |
| `spec.replicas` | integer | - | Number of nodes in the pool | **Required** - Use odd numbers for controller pools |
| `spec.roles` | array | - | Node roles (broker, controller) | **Required** - Use `["broker"]` for broker-only pools |
| `spec.storage.type` | string | - | Storage type (persistent-claim, jbod) | **Recommended: `jbod`** for production |
| `spec.storage.volumes` | array | - | Storage volume configurations | Define size and retention policies |
| `spec.resources` | object | - | CPU and memory resource limits | Set appropriate limits for workload |

### KafkaConnect Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `spec.version` | string | - | Kafka Connect version | **Required** - Match Kafka cluster version |
| `spec.replicas` | integer | `1` | Number of Connect worker nodes | Scale based on connector load |
| `spec.bootstrapServers` | string | - | Kafka cluster connection string | **Required** - Use internal service names |
| `spec.tls.trustedCertificates` | array | - | TLS certificate configuration | Required for TLS-enabled clusters |
| `spec.config` | object | - | Connect cluster configuration | Configure topics for offsets, configs, status |
| `spec.build` | object | - | Container image build configuration | Use for custom connector plugins |

### KafkaBridge Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `spec.replicas` | integer | `1` | Number of bridge instances | Scale for high availability |
| `spec.bootstrapServers` | string | - | Kafka cluster connection string | **Required** - Use internal service names |
| `spec.http.port` | integer | `8080` | HTTP REST API port | Use standard port for consistency |
| `spec.consumer` | object | - | Default consumer configuration | Set timeouts and auto-commit settings |
| `spec.producer` | object | - | Default producer configuration | Configure batching and retry settings |

### KafkaTopic Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `metadata.labels."strimzi.io/cluster"` | string | - | Target Kafka cluster name | **Required** - Must match Kafka CR name |
| `spec.partitions` | integer | - | Number of topic partitions | **Required** - Consider parallelism needs |
| `spec.replicas` | integer | - | Number of partition replicas | **Required** - Use 3 for production |
| `spec.config.retention.ms` | string | - | Message retention time in milliseconds | Set based on data lifecycle requirements |
| `spec.config.segment.bytes` | string | - | Log segment size in bytes | Use `1073741824` (1GB) for high throughput |

### KafkaUser Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `metadata.labels."strimzi.io/cluster"` | string | - | Target Kafka cluster name | **Required** - Must match Kafka CR name |
| `spec.authentication.type` | string | - | Authentication method (tls, scram-sha-256, scram-sha-512) | **Recommended: `tls`** for mutual TLS |
| `spec.authorization.type` | string | - | Authorization method (simple, opa, keycloak) | **Recommended: `simple`** for ACL-based control |
| `spec.authorization.acls` | array | - | Access control list rules | **Required** - Define specific permissions |
| `spec.quotas` | object | - | User-specific quotas | Set producer/consumer rate limits |

### KafkaConnector Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `metadata.labels."strimzi.io/cluster"` | string | - | Target KafkaConnect cluster name | **Required** - Must match KafkaConnect CR name |
| `spec.class` | string | - | Connector class name | **Required** - Use fully qualified class name |
| `spec.tasksMax` | integer | - | Maximum number of connector tasks | **Required** - Balance parallelism vs resources |
| `spec.config` | object | - | Connector-specific configuration | **Required** - Connector class dependent |
| `spec.pause` | boolean | `false` | Whether to pause the connector | Use for maintenance or debugging |

## Examples

### Basic Kafka Cluster

For development environments with KRaft mode and node pools:

```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
  name: my-cluster
  annotations:
    strimzi.io/node-pools: enabled
    strimzi.io/kraft: enabled
spec:
  kafka:
    version: 4.0.0
    metadataVersion: 4.0-IV3
    listeners:
      - name: plain
        port: 9092
        type: internal
        tls: false
      - name: tls
        port: 9093
        type: internal
        tls: true
    config:
      offsets.topic.replication.factor: 3
      transaction.state.log.replication.factor: 3
      transaction.state.log.min.isr: 2
      default.replication.factor: 3
      min.insync.replicas: 2
  entityOperator:
    topicOperator: {}
    userOperator: {}
```

### Basic KafkaNodePool

Complementary node pool for the Kafka cluster above:

```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaNodePool
metadata:
  name: my-pool
  labels:
    strimzi.io/cluster: my-cluster
spec:
  replicas: 3
  roles:
    - broker
  storage:
    type: jbod
    volumes:
      - id: 0
        type: persistent-claim
        size: 100Gi
        deleteClaim: false
```

### Basic KafkaConnect

For data integration pipelines:

```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaConnect
metadata:
  name: my-connect-cluster
spec:
  version: 4.0.0
  replicas: 1
  bootstrapServers: my-cluster-kafka-bootstrap:9093
  tls:
    trustedCertificates:
      - secretName: my-cluster-cluster-ca-cert
        pattern: '*.crt'
  config:
    group.id: connect-cluster
    offset.storage.topic: connect-cluster-offsets
    config.storage.topic: connect-cluster-configs
    status.storage.topic: connect-cluster-status
    config.storage.replication.factor: -1
    offset.storage.replication.factor: -1
    status.storage.replication.factor: -1
```

### Basic KafkaBridge

For HTTP-based access to Kafka:

```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaBridge
metadata:
  name: my-bridge
spec:
  replicas: 1
  bootstrapServers: my-cluster-kafka-bootstrap:9092
  http:
    port: 8080
```

### Basic KafkaTopic

For application message storage:

```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: my-topic
  labels:
    strimzi.io/cluster: my-cluster
spec:
  partitions: 10
  replicas: 3
  config:
    retention.ms: 604800000
    segment.bytes: 1073741824
```

### Basic KafkaUser

For application authentication and authorization:

```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaUser
metadata:
  name: my-user
  labels:
    strimzi.io/cluster: my-cluster
spec:
  authentication:
    type: tls
  authorization:
    type: simple
    acls:
      - resource:
          type: topic
          name: my-topic
          patternType: literal
        operations: [Read, Describe, Write, Create]
        host: '*'
      - resource:
          type: group
          name: my-group
          patternType: literal
        operations: [Read]
        host: '*'
```

### Basic KafkaConnector

For data pipeline integration:

```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaConnector
metadata:
  name: my-source-connector
  labels:
    strimzi.io/cluster: my-connect-cluster
spec:
  class: org.apache.kafka.connect.file.FileStreamSourceConnector
  tasksMax: 1
  config:
    file: /opt/kafka/LICENSE
    topic: my-topic
```

### Production Configuration

For production workloads with enhanced security and monitoring:

```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
  name: production-cluster
  namespace: production
  annotations:
    strimzi.io/node-pools: enabled
    strimzi.io/kraft: enabled
spec:
  kafka:
    version: 4.0.0
    metadataVersion: 4.0-IV3
    listeners:
      - name: tls
        port: 9093
        type: internal
        tls: true
        authentication:
          type: tls
      - name: external
        port: 9094
        type: route
        tls: true
        authentication:
          type: tls
    authorization:
      type: simple
    config:
      offsets.topic.replication.factor: 3
      transaction.state.log.replication.factor: 3
      transaction.state.log.min.isr: 2
      default.replication.factor: 3
      min.insync.replicas: 2
      log.message.format.version: 4.0-IV3
      inter.broker.protocol.version: 4.0-IV3
  entityOperator:
    topicOperator:
      watchedNamespace: production
    userOperator:
      watchedNamespace: production
    tlsSidecar:
      resources:
        requests:
          cpu: 100m
          memory: 128Mi
        limits:
          cpu: 500m
          memory: 512Mi
---
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaNodePool
metadata:
  name: production-brokers
  namespace: production
  labels:
    strimzi.io/cluster: production-cluster
spec:
  replicas: 5
  roles:
    - broker
  storage:
    type: jbod
    volumes:
      - id: 0
        type: persistent-claim
        size: 500Gi
        deleteClaim: false
        class: fast-ssd
  resources:
    requests:
      memory: 4Gi
      cpu: 1000m
    limits:
      memory: 8Gi
      cpu: 2000m
  jvmOptions:
    -Xms: 2048m
    -Xmx: 4096m
```

## Operational Tips

### Cluster Management

#### Rolling Upgrades

Strimzi automatically handles rolling upgrades when configuration changes are made:

```bash
# Check cluster status during upgrade
kubectl get kafka my-cluster -o yaml | grep -A 10 status

# Monitor pod rollout
kubectl rollout status statefulset/my-cluster-kafka

# Check upgrade progress
kubectl describe kafka my-cluster | grep -A 20 "Conditions"
```

#### Partition Reassignments

For rebalancing partitions across brokers:

```bash
# Check current partition distribution
kubectl exec my-cluster-kafka-0 -- bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --describe --topic my-topic

# Trigger partition reassignment (via topic CR update)
kubectl patch kafkatopic my-topic --type='merge' \
  -p='{"spec":{"partitions":20}}'
```

### Connector Management

#### Checking Connector Status

Monitor connector health and task status:

```bash
# List all connectors
kubectl get kafkaconnector -A

# Check specific connector status
kubectl describe kafkaconnector my-source-connector

# Check connector tasks via REST API
kubectl port-forward svc/my-connect-cluster-connect-api 8083:8083
curl http://localhost:8083/connectors/my-source-connector/status
```

#### Connector Troubleshooting

Common connector issues and solutions:

```bash
# Check connector pod logs
kubectl logs deployment/my-connect-cluster-connect

# Restart failed connector tasks
kubectl patch kafkaconnector my-source-connector --type='merge' \
  -p='{"spec":{"pause":true}}'
kubectl patch kafkaconnector my-source-connector --type='merge' \
  -p='{"spec":{"pause":false}}'

# Check Connect cluster configuration
kubectl get kafkaconnect my-connect-cluster -o yaml
```

### Security Operations

#### Certificate Management

Managing TLS certificates for secure communication:

```bash
# Check cluster CA certificate
kubectl get secret my-cluster-cluster-ca-cert -o yaml

# Extract user certificate
kubectl get secret my-user -o jsonpath='{.data.user\.crt}' | base64 -d

# Check certificate expiration
kubectl get secret my-cluster-cluster-ca-cert \
  -o jsonpath='{.data.ca\.crt}' | base64 -d | openssl x509 -dates -noout
```

#### ACL Management

Managing access control lists for users:

```bash
# Check user ACLs
kubectl describe kafkauser my-user

# List all ACLs in cluster
kubectl exec my-cluster-kafka-0 -- bin/kafka-acls.sh \
  --bootstrap-server localhost:9092 --list
```

### Performance Optimization

#### Resource Tuning

Optimize Kafka cluster performance:

- **JVM Settings**: Configure heap size based on available memory
- **Storage**: Use fast SSDs for high-throughput workloads
- **Network**: Ensure adequate bandwidth for replication
- **Monitoring**: Enable JMX metrics for performance monitoring

#### Topic Configuration

Optimize topic settings for specific use cases:

```yaml
# High-throughput topics
spec:
  config:
    batch.size: 65536
    linger.ms: 5
    compression.type: lz4
    segment.bytes: 1073741824

# Long-retention topics
spec:
  config:
    retention.ms: 2592000000  # 30 days
    cleanup.policy: compact
    min.cleanable.dirty.ratio: 0.1
```

## FAQ

### Q: Should I use ZooKeeper or KRaft mode for new Kafka clusters?

**A:** Use **KRaft mode** for new deployments. It's the future of Kafka, provides better scalability, and eliminates ZooKeeper dependencies. Enable it with the `strimzi.io/kraft: enabled` annotation.

### Q: How do I handle Kafka cluster scaling?

**A:** Use KafkaNodePool CRs for fine-grained scaling control:
- **Scale up**: Increase `replicas` in the node pool
- **Scale down**: Decrease `replicas` (ensure no partition replicas on nodes being removed)
- **Add node pools**: Create additional KafkaNodePool CRs with different configurations

### Q: What's the difference between internal and external listeners?

**A:** 
- **Internal listeners**: Used for in-cluster communication (other pods in the same cluster)
- **External listeners**: Used for external access (applications outside the Kubernetes cluster)
- Configure external listeners with `type: route`, `nodeport`, or `loadbalancer` based on your infrastructure

### Q: How do I backup and restore Kafka topics?

**A:** Strimzi doesn't provide built-in backup. Consider these approaches:
- **MirrorMaker 2**: Replicate topics to a backup cluster
- **Kafka Connect**: Use connectors to export data to external storage
- **Volume snapshots**: Backup persistent volumes (requires cluster downtime)

### Q: Can I use custom Kafka Connect plugins?

**A:** Yes, use the `build` configuration in KafkaConnect CR:
```yaml
spec:
  build:
    output:
      type: docker
      image: my-registry/my-connect:latest
    plugins:
      - name: my-connector
        artifacts:
          - type: zip
            url: https://example.com/my-connector.zip
```

### Q: How do I monitor Kafka cluster health?

**A:** Use these approaches:
- **JMX metrics**: Enable JMX and scrape with Prometheus
- **Strimzi metrics**: Use built-in Kafka and ZooKeeper exporters
- **Cruise Control**: Deploy for advanced monitoring and rebalancing
- **Cluster status**: Monitor CR status conditions and events

### Q: What happens when I delete a KafkaTopic CR?

**A:** The Topic Operator will delete the corresponding Kafka topic and all its data. This operation is **not reversible**. Ensure you have backups before deleting topics in production.

### Q: How do I upgrade Kafka versions?

**A:** Update the `spec.kafka.version` field in your Kafka CR:
1. Check version compatibility in Strimzi documentation
2. Update the Kafka CR with the new version
3. Monitor the rolling upgrade process
4. Update `metadataVersion` after all brokers are upgraded

### Q: Can I run multiple Kafka clusters in the same namespace?

**A:** Yes, but ensure:
- Each cluster has a unique name
- Node pools are properly labeled with their cluster name
- Topics and users reference the correct cluster name
- Resource names don't conflict

## Additional Resources

For deeper understanding of Strimzi concepts and advanced configurations:

- **[Strimzi Documentation](https://strimzi.io/docs/)** - Official Strimzi documentation
- **[Strimzi API Reference](https://strimzi.io/docs/operators/latest/configuring.html)** - Complete API documentation
- **[Apache Kafka Documentation](https://kafka.apache.org/documentation/)** - Upstream Kafka documentation
- **[Kafka Configuration Reference](https://kafka.apache.org/documentation/#configuration)** - Kafka broker and topic configuration
- **[Strimzi Examples](https://github.com/strimzi/strimzi-kafka-operator/tree/main/examples)** - Example configurations and use cases
- **[Kafka Connect Guide](https://kafka.apache.org/documentation/#connect)** - Kafka Connect framework documentation
- **[Kafka Security](https://kafka.apache.org/documentation/#security)** - Security configuration and best practices

### Version Matrix

| Platform Version | Strimzi Operator Channel | Kafka Version | Supported Features |
|------------------|-------------------------|---------------|-------------------|
| 1.1.x | stable | 4.0.0 | All CRs, KRaft mode, Node pools |
| 1.0.x | stable | 3.8.x | Basic CRs, ZooKeeper mode |

### Strimzi CLI Tools

Install the Strimzi CLI for enhanced operational capabilities:

```bash
# Install Strimzi CLI
curl -L https://github.com/strimzi/strimzi-kafka-cli/releases/latest/download/strimzi-kafka-cli-linux-amd64.tar.gz \
  | tar xz -C /usr/local/bin

# List Kafka clusters
strimzi clusters

# Describe topics
strimzi topics --cluster my-cluster

# Check user permissions
strimzi users --cluster my-cluster describe my-user
```

---

*This documentation is maintained alongside the platform codebase. When making changes to Strimzi configurations, please update this reference accordingly.*