# GitOps with Flux

Flux is a GitOps toolkit for managing Kubernetes clusters. It provides a declarative way to manage your infrastructure and applications, ensuring that your cluster state matches your Git repository.

## Overview

Flux enables GitOps workflows by:

- **Automatic synchronization** - Continuously monitors Git repositories and applies changes to your cluster
- **Security** - Uses Kubernetes service accounts and RBAC for secure operations
- **Extensibility** - Supports Helm charts, Kustomize, and plain Kubernetes manifests
- **Multi-tenancy** - Isolate workloads and configurations across teams and environments

## Key Components

### Git Repository Sources
Define Git repositories that contain your Kubernetes manifests or Helm charts.

### Kustomizations
Specify how to build and deploy workloads from your Git sources using Kustomize.

### Helm Releases
Manage Helm chart deployments with automated upgrades and rollbacks.

## Documentation Sections

- **[Custom Resources](flux-crs.md)** - Complete reference for Flux custom resources including GitRepository, Kustomization, and HelmRelease

## Getting Started

To get started with Flux in the Platform CDK8s project:

1. Review the [Architecture](../architecture.md) to understand how Flux fits into the platform
2. Study the [Custom Resources](flux-crs.md) documentation for detailed configuration options
3. Check the [Operations Guide](../operations.md) for deployment and management procedures

## Quick Links

- [Flux Official Documentation](https://fluxcd.io/docs/)
- [GitOps Principles](https://opengitops.dev/)
- [Flux GitHub Repository](https://github.com/fluxcd/flux2)