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

- **[Getting Started](getting-started.md)** - Set up your development environment
- **[Architecture](architecture.md)** - Understand the system design and components
- **[Development](development.md)** - Development workflows and best practices
- **[Contributing](contributing.md)** - How to contribute to the project
- **[Operations](operations.md)** - Administrative procedures and operational tasks
- **[Troubleshooting](troubleshooting.md)** - Common issues and solutions
- **[API Reference](api-reference.md)** - Technical reference documentation

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
