# Flux Custom Resources

This page provides a comprehensive reference for the two core Flux Custom Resources (CRs) used in our Modern Platform Experience: **GitRepository** and **Kustomization**. These resources enable GitOps continuous delivery by managing source code synchronization and workload deployment declaratively.

## Overview

Flux operates on a two-stage reconciliation model that separates source management from workload deployment:

### GitRepository - Source Management
The `GitRepository` CR defines a source of truth by tracking a Git repository. Flux continuously monitors the specified repository and branch, detecting changes and making the source code available to other Flux components.

**Lifecycle:**
1. **Fetch**: Downloads and caches repository content
2. **Verify**: Validates source integrity (if GPG verification enabled)
3. **Expose**: Makes source available via internal artifact storage
4. **Reconcile**: Repeats based on `spec.interval`

### Kustomization - Workload Deployment
The `Kustomization` CR defines how to deploy workloads from a source. It references a `GitRepository` (or other source) and applies Kubernetes manifests to the cluster using Kustomize.

**Lifecycle:**
1. **Source**: Retrieves manifests from referenced source
2. **Build**: Processes manifests using Kustomize
3. **Apply**: Deploys resources to Kubernetes cluster
4. **Health Check**: Monitors resource health and readiness
5. **Prune**: Removes resources no longer defined (if enabled)
6. **Reconcile**: Repeats based on `spec.interval`

## Field Reference

### GitRepository Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `spec.interval` | string | `1m` | How often to fetch the repository | Use `1m` for development, `5m` for production |
| `spec.ref.branch` | string | - | Git branch to track | Use `main` or `master` for production, feature branches for development |
| `spec.ref.tag` | string | - | Git tag to track | Use for immutable releases |
| `spec.ref.commit` | string | - | Specific commit SHA | Use for pinning to exact versions |
| `spec.url` | string | - | Repository URL (HTTPS or SSH) | **Required** - Use HTTPS for public repos, SSH with deploy keys for private |
| `spec.timeout` | string | `60s` | Timeout for Git operations | Increase for large repositories |
| `spec.secretRef.name` | string | - | Secret containing credentials | Required for private repositories |

### Kustomization Fields

| Field | Type | Default | Description | Our Guidance |
|-------|------|---------|-------------|--------------|
| `spec.interval` | string | `10m` | How often to reconcile | Use `1m` for development, `5m-10m` for production |
| `spec.path` | string | `./` | Path within repository to Kustomize root | Point to environment-specific overlays |
| `spec.prune` | boolean | `false` | Remove resources not defined in source | **Recommended: `true`** for clean deployments |
| `spec.sourceRef.kind` | string | - | Type of source (GitRepository, Bucket, etc.) | Use `GitRepository` for Git-based sources |
| `spec.sourceRef.name` | string | - | Name of source resource | **Required** - Must match GitRepository name |
| `spec.timeout` | string | `5m` | Timeout for operations | Increase for complex deployments |
| `spec.wait` | boolean | `false` | Wait for resources to be ready | **Recommended: `true`** for ordered deployments |
| `spec.targetNamespace` | string | - | Override namespace for resources | Use to deploy to specific namespace |

## Examples

### Basic GitRepository

Copy and paste this example to create a GitRepository that tracks the podinfo demo application:

```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta1
kind: GitRepository
metadata:
  name: podinfo
  namespace: dev
spec:
  interval: 1m
  ref:
    branch: master
  url: "https://github.com/stefanprodan/podinfo"
```

### Basic Kustomization

This example shows how to deploy the podinfo application using the GitRepository defined above:

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: podinfo
  namespace: dev
spec:
  interval: 5m
  path: ./deploy/overlays/dev
  prune: true
  sourceRef:
    kind: GitRepository
    name: podinfo
  timeout: 2m
  wait: true
```

### Advanced Configuration

For production workloads, consider this enhanced configuration:

```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta1
kind: GitRepository
metadata:
  name: platform-apps
  namespace: production
spec:
  interval: 5m
  ref:
    branch: main
  url: "https://github.com/your-org/platform-apps"
  timeout: 2m
---
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: platform-apps
  namespace: production
spec:
  interval: 10m
  path: ./environments/production
  prune: true
  sourceRef:
    kind: GitRepository
    name: platform-apps
  timeout: 5m
  wait: true
  healthChecks:
    - apiVersion: apps/v1
      kind: Deployment
      name: api-server
      namespace: production
  postBuild:
    substitute:
      environment: "production"
      replicas: "3"
```

## Operational Tips

### Common Troubleshooting Commands

Check Flux resource status:
```bash
# List all GitRepositories
flux get sources git

# List all Kustomizations
flux get kustomizations

# Check specific resource status
kubectl describe gitrepository podinfo -n dev
kubectl describe kustomization podinfo -n dev
```

### Debugging GitRepository Issues

**Stale commits or fetch failures:**
```bash
# Check GitRepository events
kubectl get events -n dev --field-selector involvedObject.name=podinfo

# Force reconciliation
flux reconcile source git podinfo -n dev

# Check Flux logs
kubectl logs -n flux-system deployment/source-controller -f
```

**Common issues:**
- **Authentication failures**: Verify `secretRef` points to valid credentials
- **Branch not found**: Check `spec.ref.branch` matches actual branch name
- **Network timeouts**: Increase `spec.timeout` for large repositories

### Debugging Kustomization Issues

**Stuck Kustomization health checks:**
```bash
# Check Kustomization status
kubectl get kustomization podinfo -n dev -o yaml

# View applied resources
kubectl get all -l kustomize.toolkit.fluxcd.io/name=podinfo -n dev

# Check health check status
kubectl describe kustomization podinfo -n dev | grep -A 10 "Health Checks"
```

**Common issues:**
- **Build failures**: Verify `spec.path` points to valid Kustomize directory
- **Apply errors**: Check RBAC permissions for Flux service account
- **Resource conflicts**: Use `spec.force: true` cautiously for overwrites
- **Timeout issues**: Increase `spec.timeout` for large deployments

### Performance Optimization

- **Reduce reconciliation frequency** for stable workloads
- **Use `suspend: true`** to temporarily disable reconciliation
- **Implement health checks** to detect deployment issues early
- **Enable pruning** to keep environments clean

## FAQ

### Q: Should I use GitRepository or HelmRepository for Helm charts?

**A:** Use `HelmRepository` for Helm chart repositories and `GitRepository` for Git repositories containing Helm charts or raw manifests. For maximum compatibility, store Helm charts in Git and use GitRepository with Kustomization.

### Q: How do I handle secrets in GitOps?

**A:** Never commit secrets to Git. Use one of these approaches:
- **External Secrets Operator** to sync from external secret stores
- **Sealed Secrets** to encrypt secrets in Git
- **SOPS** with Flux's SOPS integration
- **Vault** integration for dynamic secret injection

### Q: Can I use multiple GitRepositories in one Kustomization?

**A:** No, each Kustomization can only reference one source. Use multiple Kustomizations or organize your repository structure to include all needed resources in one location.

### Q: How do I rollback a deployment?

**A:** Rollback options:
1. **Git revert**: Revert the commit in Git and let Flux reconcile
2. **Suspend and manual rollback**: Suspend the Kustomization and manually rollback
3. **Pin to previous commit**: Update GitRepository to point to previous commit

### Q: What's the difference between interval and timeout?

**A:** 
- **interval**: How often Flux checks for changes (reconciliation frequency)
- **timeout**: Maximum time to wait for an operation to complete

## Additional Resources

For deeper understanding of Flux concepts and advanced configurations:

- **[Flux Documentation](https://fluxcd.io/docs/)** - Official Flux documentation
- **[GitOps Toolkit](https://fluxcd.io/docs/components/)** - Core Flux components
- **[Flux API Reference](https://fluxcd.io/docs/components/source/api/)** - Complete API documentation
- **[Flux Guides](https://fluxcd.io/docs/guides/)** - Practical implementation guides
- **[Flux Community](https://fluxcd.io/community/)** - Support and discussions

---

*This documentation is maintained alongside the platform codebase. When making changes to Flux configurations, please update this reference accordingly.*