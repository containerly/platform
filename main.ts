import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import { OperatorGroup, Subscription } from './imports/operators.coreos.com';
import { Namespace } from 'cdk8s-plus-29';

export class Platform extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    // Flux Namespace
    new Namespace(this, 'flux-system', {
      metadata: {
        name: 'flux-system',
      },
    });

    // Flux Operator Group
    new OperatorGroup(this, 'flux-operator-group', {
      metadata: {
        name: 'flux-operator-group',
        namespace: 'flux-system',
      },
      spec: {
        targetNamespaces: ['flux-system'],
      },
    });

    // Prometheus Operator Group
    new OperatorGroup(this, 'prometheus-operator-group', {
      metadata: {
        name: 'prometheus-operator-group',
        namespace: 'default',
      },
      spec: {
        targetNamespaces: ['default'],
      },
    });

    // Flux Subscription
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

    // Grafana Subscription
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

    // Prometheus Subscription
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

    // Loki Subscription
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

    // Strimzi Kafka Subscription
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

    // MinIO Subscription
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

    // Elastic Cloud ECK Subscription
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
  }
}

const app = new App();
new Platform(app, 'platform');
app.synth();
