# Platform Kustomize

A Kustomize-based repository for deploying a comprehensive platform with various operators including Flux, Grafana, Prometheus, Loki, Strimzi Kafka, MinIO, and Elastic Cloud ECK.

## Getting Started

### Prerequisites

- kubectl (v1.25+ recommended)
- kustomize (v4+)
- kind

### Repository Structure

```
platform/
├── base/
│   ├── applications/   # Application manifests (Kafka, Prometheus, Alertmanager, etc.)
│   └── operators/      # Operator installation manifests (from OperatorHub or local)
├── overlays/
│   ├── development/    # Development environment overlays
│   └── production/     # Production environment overlays
├── docs/               # Documentation
├── script/             # Utility scripts
└── README.md
```

## Workflow

### 1. Making Changes
- Edit or add manifests in `base/applications` or `base/operators`.
- Use overlays in `overlays/development` or `overlays/production` to customize resources for each environment.
- To add a new application/operator, create the manifest in `base/` and reference it in the appropriate `kustomization.yaml`.

### 2. Validating Changes

```sh
# Build and preview the development overlay
kustomize build overlays/development | kubectl apply --dry-run=client -f -

# Build and preview the production overlay
kustomize build overlays/production | kubectl apply --dry-run=client -f -
```

### 3. Applying to a Cluster

```sh
# Apply the development overlay
kubectl apply -k overlays/development

# Apply the production overlay
kubectl apply -k overlays/production
```

### 4. Adding/Upgrading Operators
- Operator manifests are referenced in `base/operators/kustomization.yaml`.
- For reproducibility, consider downloading operator manifests and versioning them in the repo, rather than referencing remote URLs directly.

### 5. Environment Customization
- Use overlays to patch resources (e.g., replica counts, resource limits, config values).
- Add patches in the overlay’s `kustomization.yaml` as needed.

## CI/CD Workflows

This project can be integrated with CI/CD pipelines to validate overlays and apply manifests to clusters. Example steps:

- Validate overlays with `kustomize build` and `kubectl apply --dry-run`.
- Lint YAML files.
- Optionally, use tools like `kubeval` or `conftest` for policy checks.

## Deployment

Use Kustomize overlays to deploy to your Kubernetes cluster:

```bash
kubectl apply -k overlays/development
# or
kubectl apply -k overlays/production
```

Or use the provided installation script:

```bash
./script/install
```

## Developer Documentation

For comprehensive developer documentation, including detailed setup instructions, architecture overview, and operational procedures, see the [documentation site](docs/).

### Documentation Sections

- **[Getting Started](docs/getting-started.md)** - Set up your development environment
- **[Architecture](docs/architecture.md)** - Understand the system design and components
- **[Development](docs/development.md)** - Development workflows and best practices
- **[Contributing](docs/contributing.md)** - How to contribute to the project
- **[Operations](docs/operations.md)** - Administrative procedures and operational tasks
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions
- **[API Reference](docs/api-reference.md)** - Technical reference documentation

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started, development workflows, and our code of conduct.
