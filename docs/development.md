# Development

This document describes development workflows, repository structure, and best practices for working with this Kustomize-based platform repository.

## Repository Structure

- `base/` — Application and operator manifests
- `overlays/` — Environment-specific overlays (development, production)
- `docs/` — Documentation
- `script/` — Utility scripts

## Workflow

- Edit or add manifests in `base/applications` or `base/operators`.
- Use overlays for environment-specific customization.
- Validate changes with `kustomize build overlays/development | kubectl apply --dry-run=client -f -`.
- Apply overlays to your cluster with `kubectl apply -k overlays/development` or `kubectl apply -k overlays/production`.

See other documentation sections for more details on contributing, operations, and troubleshooting.
