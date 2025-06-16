# Platform CDK8s

A CDK8s TypeScript project that generates Kubernetes manifests for deploying a comprehensive platform with various operators including Flux, Grafana, Prometheus, Loki, Strimzi Kafka, MinIO, and Elastic Cloud ECK.

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm

### NPM Package Installation

This project is published as an NPM package on GitHub Packages. You can install it using:

```bash
# Configure npm to use GitHub Packages for @containerly scope
npm config set @containerly:registry https://npm.pkg.github.com

# Install the package
npm install @containerly/platform
```

For development, you can also clone and build locally:

### Local Development Installation

```bash
npm install
```

### Build Commands

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Compile TypeScript
npm run compile

# Synthesize CDK8s manifests
npm run synth

# Full build (compile + test + synth)
npm run build
```

## Generated Output

The project generates Kubernetes manifests in the `dist/platform.k8s.yaml` file, which includes:

- Flux system namespace and operator
- Grafana operator subscription
- Prometheus operator subscription  
- Loki operator subscription
- Strimzi Kafka operator subscription
- MinIO operator subscription
- Elastic Cloud ECK operator subscription

## CI/CD Workflows

This project includes automated GitHub Actions workflows:

### CI Workflow (`.github/workflows/ci.yml`)
- Triggers on push to `main` or `develop` branches
- Tests on Node.js 18.x and 20.x
- Runs tests, compilation, and CDK8s synthesis
- Uploads generated manifests as artifacts

### PR Validation (`.github/workflows/pr.yml`)
- Triggers on pull requests to `main` branch
- Validates code changes without creating releases
- Uploads PR artifacts for review

### Documentation Workflow (`.github/workflows/docs.yml`)
- Triggers on push to `main` branch and PRs when documentation files change
- Builds MkDocs documentation with Material theme
- Deploys documentation to GitHub Pages
- Validates documentation builds in pull requests

### Release Workflow (`.github/workflows/release.yml`)
- Triggers on push to `main` branch
- Implements semantic versioning based on commit messages
- Automatically creates GitHub releases with synthesized manifests
- Publishes NPM package to GitHub Packages (@containerly/platform)

#### Commit Message Conventions

The release workflow uses commit message conventions for automatic version bumping:

- `feat:` or `[minor]` → Minor version bump (1.0.0 → 1.1.0)
- `fix:` or `[patch]` → Patch version bump (1.0.0 → 1.0.1)  
- `feat!:` or `BREAKING CHANGE:` or `[major]` → Major version bump (1.0.0 → 2.0.0)
- Other commits → Patch version bump (default)

## Deployment

Use the generated manifest to deploy to your Kubernetes cluster:

```bash
kubectl apply -f dist/platform.k8s.yaml
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

### Building Documentation

To build and serve the documentation locally:

```bash
# Install MkDocs and dependencies
pip install mkdocs mkdocs-material pymdown-extensions

# Serve documentation locally
mkdocs serve

# Build static documentation
mkdocs build
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started, development workflows, and our code of conduct.