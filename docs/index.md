# Platform CDK8s Developer Documentation

Welcome to the developer documentation for the Containerly Platform CDK8s project. This documentation provides comprehensive guidance for developers and administrators working with this Kubernetes platform deployment system.

## Overview

The Platform CDK8s project is a TypeScript-based CDK8s application that generates Kubernetes manifests for deploying a comprehensive platform with various operators including:

- **Flux** - GitOps continuous delivery
- **Grafana** - Monitoring and observability dashboards  
- **Prometheus** - Metrics collection and alerting
- **Loki** - Log aggregation and querying
- **Strimzi Kafka** - Apache Kafka on Kubernetes
- **MinIO** - Object storage
- **Elastic Cloud ECK** - Elasticsearch, Kibana, and APM

## Quick Navigation

### :rocket: Getting Started
Start your journey with the Platform CDK8s project:

- **[Getting Started Guide](getting-started.md)** - Set up your development environment and run your first build
- **[Architecture Overview](architecture.md)** - Understand the system design and platform components

### :hammer_and_wrench: Development
Learn how to work with and contribute to the project:

- **[Development Guide](development.md)** - Development workflows, coding standards, and best practices
- **[Contributing](contributing.md)** - How to contribute code, documentation, and report issues
- **[Version Management](version-management.md)** - Automated and manual version management workflows

### :gear: Platform Components
Explore the individual platform components and their capabilities:

- **[GitOps with Flux](flux/index.md)** - Continuous deployment and GitOps workflows
- **[Observability Stack](observability/index.md)** - Monitoring, metrics, and visualization with Prometheus and Grafana
- **[Messaging Platform](messaging/index.md)** - Event streaming and messaging with Apache Kafka

### :wrench: Operations
Deploy, manage, and troubleshoot your platform:

- **[Operations Guide](operations.md)** - Deployment procedures and operational tasks
- **[Troubleshooting](troubleshooting.md)** - Common issues and their solutions

### :books: Reference
Technical reference and API documentation:

- **[API Reference](api-reference.md)** - Complete technical reference documentation

---

## Learning Path

New to the platform? Follow this progressive learning path:

1. **:point_right: Start Here**: [Getting Started](getting-started.md) - Set up your environment
2. **:mag: Understand**: [Architecture](architecture.md) - Learn the system design
3. **:construction_worker: Build**: [Development](development.md) - Learn development workflows
4. **:package: Explore**: [Platform Components](flux/index.md) - Dive into specific components
5. **:rocket: Deploy**: [Operations](operations.md) - Learn deployment and management

## Key Features

### Automated CI/CD Pipeline
The project includes comprehensive GitHub Actions workflows for continuous integration, pull request validation, and automated releases with semantic versioning.

### Operator Lifecycle Management (OLM)
All operators are deployed using OLM subscriptions, providing consistent lifecycle management and upgrade paths.

### Infrastructure as Code
The entire platform configuration is defined as code using CDK8s, enabling version control, peer review, and reproducible deployments.

### NPM Package Distribution
The project is published as an NPM package to GitHub Packages, making it easy to consume and integrate into other projects.

## Repository Structure

```
platform/
├── .github/workflows/     # CI/CD pipeline definitions
├── docs/                  # Documentation source files
├── script/                # Operational scripts
├── imports/               # Generated CDK8s imports
├── dist/                  # Generated Kubernetes manifests
├── main.ts                # Primary platform definition
├── main.test.ts           # Test specifications
├── package.json           # Project configuration and dependencies
└── README.md              # Basic project overview
```

## Prerequisites

Before working with this project, ensure you have:

- Node.js 18.x or 20.x
- npm package manager
- Kubernetes cluster access (for deployment)
- Git for version control

## Support and Communication

For questions, issues, or contributions:

- Open issues on [GitHub Issues](https://github.com/containerly/platform/issues)
- Review existing documentation in this site
- Check the troubleshooting guide for common problems

## License

This project is licensed under the Apache License 2.0. See the LICENSE file for details.

---

This documentation is maintained alongside the codebase and automatically deployed to GitHub Pages when changes are pushed to the main branch. When making changes to the platform, please update the relevant documentation sections to keep them current and accurate.
