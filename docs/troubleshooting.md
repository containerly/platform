# Troubleshooting

This guide provides solutions for common issues encountered when working with the Platform Kustomize project, including deployment and operational problems.

## General Troubleshooting Approach

### Systematic Problem Solving

1. **Identify the Problem**
   - Clearly define what is not working
   - Determine when the problem started
   - Identify what has changed recently

2. **Gather Information**
   - Check logs and error messages
   - Review system status and metrics
   - Collect relevant configuration details

3. **Isolate the Issue**
   - Test individual components
   - Narrow down the scope of the problem
   - Reproduce the issue consistently

4. **Apply Solutions**
   - Start with the most likely solutions
   - Test one change at a time
   - Document what works and what doesn't

5. **Verify Resolution**
   - Confirm the problem is resolved
   - Test related functionality
   - Monitor for recurring issues

### Information Collection

Always collect this information when troubleshooting:

```bash
# Platform information
kubectl version
kubectl get nodes
kubectl get namespaces
kubectl get pods -A | grep -E "(operator|olm)"
# Platform-specific status
kubectl get subscriptions -A
kubectl get csv -A
kubectl get installplans -A
```

## Common Issues

### Kubernetes Cluster Issues

#### Issue: Cluster Access Problems

**Symptoms:**
- `kubectl` commands fail
- Authentication errors
- Connection timeouts

**Solutions:**
```bash
kubectl config view
kubectl cluster-info
kubectl config current-context
kubectl config use-context CONTEXT_NAME
kubectl auth can-i "*" "*" --all-namespaces
```

#### Issue: Insufficient Cluster Resources

**Symptoms:**
- Pods stuck in Pending state
- Resource quota exceeded errors
- Node resource constraints

**Solutions:**
```bash
kubectl top nodes
kubectl describe nodes
kubectl get resourcequotas -A
kubectl get pods -n operators -o json | jq '.items[] | {name: .metadata.name, resources: .spec.containers[].resources}'
```

### OLM (Operator Lifecycle Manager) Issues

#### Issue: OLM Not Installed

**Symptoms:**
- Operator installations fail
- Missing CRDs for subscriptions
- OLM pods not running

**Solutions:**
```bash
# Check if OLM is installed
kubectl get pods -n olm

# Install OLM using script
./script/olm

# Manual OLM installation
operator-sdk olm install

# Verify OLM installation
kubectl get csv -n olm
```

#### Issue: Catalog Source Problems

**Symptoms:**
- Operators not available for installation
- Catalog source connection failures
- Package manifest errors

**Solutions:**
```bash
# Check catalog sources
kubectl get catalogsources -n olm

# Check catalog source status
kubectl describe catalogsource operatorhubio-catalog -n olm

# Restart catalog source pod
kubectl delete pod -n olm -l olm.catalogSource=operatorhubio-catalog

# Check catalog source logs
kubectl logs -n olm deployment/operatorhubio-catalog-server
```

### Operator Installation Issues

#### Issue: Subscription Creation Failures

**Symptoms:**
- Subscriptions not created
- Install plans not generated
- Operator not available in catalog

**Solutions:**
```bash
# Check if operator exists in catalog
kubectl get packagemanifests | grep prometheus

# Check subscription status
kubectl describe subscription prometheus-subscription -n operators

# Check for conflicting subscriptions
kubectl get subscriptions -A | grep prometheus

# Verify namespace exists
kubectl get namespace operators
```

#### Issue: Install Plan Approval Problems

**Symptoms:**
- Install plans stuck in pending state
- Manual approval required but not provided
- Install plan execution failures

**Solutions:**
```bash
# Check install plan status
kubectl get installplans -n operators

# Approve manual install plans
kubectl patch installplan -n operators INSTALL_PLAN_NAME --type='merge' -p='{"spec":{"approved":true}}'

# Check install plan requirements
kubectl describe installplan -n operators INSTALL_PLAN_NAME

# Check for resource conflicts
kubectl get events -n operators | grep -i error
```

#### Issue: Operator Pod Failures

**Symptoms:**
- Operator pods crash or fail to start
- Image pull errors
- Resource constraint errors

**Solutions:**
```bash
# Check operator pod status
kubectl get pods -n operators

# Describe failing pod
kubectl describe pod OPERATOR_POD_NAME -n operators

# Check pod logs
kubectl logs OPERATOR_POD_NAME -n operators

# Check events
kubectl get events -n operators --sort-by='.lastTimestamp'

# Check resource limits
kubectl get pods -n operators -o json | jq '.items[] | {name: .metadata.name, resources: .spec.containers[].resources}'
```

## Runtime Issues

### Operator Health Issues

#### Issue: Operator Not Reconciling

**Symptoms:**
- Custom resources not processed
- Status not updating
- Operator appears idle

**Solutions:**
```bash
# Check operator logs
kubectl logs deployment/prometheus-operator -n operators -f

# Check custom resource status
kubectl describe prometheus example-prometheus -n default

# Check operator permissions
kubectl describe clusterrole prometheus-operator

# Restart operator
kubectl rollout restart deployment/prometheus-operator -n operators
```

#### Issue: Custom Resource Validation Failures

**Symptoms:**
- Custom resources rejected
- Validation webhook errors
- Schema validation failures

**Solutions:**
```bash
# Check custom resource definition
kubectl get crd prometheuses.monitoring.coreos.com -o yaml

# Validate custom resource against schema
kubectl apply --dry-run=server -f custom-resource.yaml

# Check admission controller logs
kubectl logs -n operators deployment/prometheus-operator | grep -i webhook

# Check validating webhook configuration
kubectl get validatingwebhookconfigurations | grep prometheus
```

### Resource Management Issues

#### Issue: Resource Quota Exceeded

**Symptoms:**
- Pods cannot be scheduled
- Resource quota errors
- New resources rejected

**Solutions:**
```bash
# Check resource quotas
kubectl get resourcequotas -A

# Check current resource usage
kubectl top pods -A
kubectl top nodes

# Describe resource quota
kubectl describe resourcequota -n operators

# Increase quota or reduce resource requests
kubectl edit resourcequota resource-quota-name -n operators
```

#### Issue: Persistent Volume Issues

**Symptoms:**
- Pods stuck in pending due to volume mounting
- PVC in pending state
- Storage class issues

**Solutions:**
```bash
# Check persistent volume claims
kubectl get pvc -A

# Check storage classes
kubectl get storageclass

# Describe PVC for details
kubectl describe pvc CLAIM_NAME -n NAMESPACE

# Check node storage availability
kubectl describe nodes | grep -A 5 "Allocated resources"

# Check for storage provisioner issues
kubectl get events -A | grep -i "provisioning\|volume"
```

## Performance Issues

### Build Performance

#### Issue: Slow Build Times

**Symptoms:**
- `npm run build` takes excessive time
- CDK8s synthesis is slow
- TypeScript compilation delays

**Solutions:**
```bash
# Use npm ci instead of npm install
npm ci

# Enable TypeScript incremental compilation
# Add to tsconfig.json:
{
  "compilerOptions": {
    "incremental": true
  }
}

# Clear build cache
npm run clean  # if available
rm -rf dist/ node_modules/.cache/

# Use watch mode for development
npm run watch
```

#### Issue: Memory Issues During Build

**Symptoms:**
- Out of memory errors during build
- Node.js heap allocation failures
- Build process killed

**Solutions:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Or set permanently in package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' npm run compile && npm run test && npm run synth"
  }
}

# Check available system memory
free -h
```

### Runtime Performance

#### Issue: High Resource Usage

**Symptoms:**
- Operators consuming excessive CPU/memory
- Cluster performance degradation
- Resource limits exceeded

**Solutions:**
```bash
# Monitor resource usage
kubectl top pods -n operators --sort-by=memory
kubectl top pods -n operators --sort-by=cpu

# Check resource limits and requests
kubectl get pods -n operators -o json | jq '.items[] | {name: .metadata.name, resources: .spec.containers[].resources}'

# Adjust resource limits
kubectl edit deployment prometheus-operator -n operators

# Scale down if possible
kubectl scale deployment prometheus-operator -n operators --replicas=1
```

## Network and Connectivity Issues

### Service Discovery Issues

#### Issue: Service-to-Service Communication Failures

**Symptoms:**
- Services cannot reach each other
- DNS resolution failures
- Connection timeouts

**Solutions:**
```bash
# Check service endpoints
kubectl get endpoints -n operators

# Test DNS resolution
kubectl run -i --tty --rm debug --image=busybox --restart=Never -- nslookup prometheus-operator.operators.svc.cluster.local

# Check network policies
kubectl get networkpolicies -A

# Check service configuration
kubectl get services -n operators
kubectl describe service prometheus-operator -n operators
```

#### Issue: External Connectivity Problems

**Symptoms:**
- Cannot reach external services
- Image pull failures
- Webhook validation failures

**Solutions:**
```bash
# Test external connectivity
kubectl run -i --tty --rm debug --image=busybox --restart=Never -- wget -qO- https://operatorhub.io

# Check proxy configuration
kubectl get configmap kube-proxy -n kube-system -o yaml

# Check firewall rules
# (Platform specific - consult cluster documentation)

# Check for network policies blocking egress
kubectl get networkpolicies -A -o yaml | grep -A 5 -B 5 egress
```

## Security Issues

### RBAC Issues

#### Issue: Permission Denied Errors

**Symptoms:**
- Operators cannot create resources
- RBAC permission errors
- Forbidden access errors

**Solutions:**
```bash
# Check operator service account
kubectl get serviceaccount -n operators

# Check role bindings
kubectl get rolebindings,clusterrolebindings -A | grep prometheus

# Check specific permissions
kubectl auth can-i create pods --as=system:serviceaccount:operators:prometheus-operator

# Describe role for detailed permissions
kubectl describe clusterrole prometheus-operator

# Check for missing permissions in logs
kubectl logs deployment/prometheus-operator -n operators | grep -i "forbidden\|permission"
```

#### Issue: Service Account Issues

**Symptoms:**
- Service account not found
- Token mounting issues
- Authentication failures

**Solutions:**
```bash
# Check service account exists
kubectl get serviceaccount prometheus-operator -n operators

# Check service account secrets
kubectl describe serviceaccount prometheus-operator -n operators

# Check token mounting
kubectl get pods -n operators -o yaml | grep -A 5 -B 5 serviceAccountName

# Recreate service account if needed
kubectl delete serviceaccount prometheus-operator -n operators
# Redeploy platform
```

### Image Security Issues

#### Issue: Image Pull Failures

**Symptoms:**
- ImagePullBackOff errors
- Registry authentication failures
- Image not found errors

**Solutions:**
```bash
# Check image pull secrets
kubectl get secrets -n operators | grep -i pull

# Check pod events for image pull errors
kubectl describe pod OPERATOR_POD -n operators | grep -A 10 Events

# Verify image exists
docker pull quay.io/prometheus-operator/prometheus-operator:latest

# Check registry authentication
kubectl get secrets -n operators -o yaml | grep -A 5 .dockerconfigjson
```

## Data and State Issues

### Persistent Data Issues

#### Issue: Data Loss or Corruption

**Symptoms:**
- Operator state lost after restart
- Configuration data missing
- Custom resources not persisting

**Solutions:**
```bash
# Check persistent volumes
kubectl get pv,pvc -A

# Verify backup procedures
# Check operator-specific backup documentation

# Check for storage class issues
kubectl describe storageclass

# Verify data integrity
kubectl exec -n operators prometheus-pod -- ls -la /data
```

#### Issue: Configuration Drift

**Symptoms:**
- Actual state differs from desired state
- Manual changes overriding automation
- Inconsistent configurations

**Solutions:**
```bash
# Compare desired vs actual state
kubectl get subscriptions -n operators -o yaml > current-state.yaml
# Compare with version control

# Reapply platform configuration
kubectl apply -f dist/platform.k8s.yaml

# Check for manual modifications
kubectl get csv -n operators -o yaml | grep -B 5 -A 5 modified
```

## CI/CD Pipeline Issues

### GitHub Actions Issues

#### Issue: Build Failures in CI

**Symptoms:**
- CI pipeline fails
- Different behavior than local build
- Environment-specific errors

**Solutions:**
```bash
# Check GitHub Actions logs
# Review .github/workflows/ configuration

# Test locally with same Node.js version
nvm use 20
npm ci
npm run build

# Check for environment differences
# Compare package-lock.json between local and CI

# Test with clean environment
docker run --rm -v $(pwd):/app -w /app node:20 npm ci && npm run build
```

#### Issue: Package Publication Failures

**Symptoms:**
- NPM publish fails
- GitHub Packages authentication issues
- Version conflicts

**Solutions:**
```bash
# Check package.json version
cat package.json | grep version

# Verify GitHub token permissions
# Check repository settings > Actions > General

# Test publish locally (if possible)
npm config set @containerly:registry https://npm.pkg.github.com
npm publish --dry-run

# Check for existing version
npm view @containerly/platform versions --json
```

## Getting Additional Help

### Log Collection

When seeking help, collect comprehensive logs:

```bash
# Create diagnostic bundle
mkdir platform-diagnostics-$(date +%Y%m%d_%H%M%S)
cd platform-diagnostics-$(date +%Y%m%d_%H%M%S)

# System information
kubectl version > kubectl-version.txt
kubectl cluster-info > cluster-info.txt
kubectl get nodes -o wide > nodes.txt

# Platform state
kubectl get all -n operators -o yaml > operators-all.yaml
kubectl get all -n flux-system -o yaml > flux-all.yaml
kubectl get subscriptions,csv,installplans -A -o yaml > olm-state.yaml

# Logs
kubectl logs deployment/prometheus-operator -n operators > prometheus-operator.log 2>&1
kubectl logs deployment/grafana-operator -n operators > grafana-operator.log 2>&1

# Events
kubectl get events -A --sort-by='.lastTimestamp' > all-events.txt

# Create archive
cd ..
tar -czf platform-diagnostics-$(date +%Y%m%d_%H%M%S).tar.gz platform-diagnostics-$(date +%Y%m%d_%H%M%S)/
```

### Community Support

1. **Search Existing Issues**: Check GitHub Issues for similar problems
2. **Review Documentation**: Consult all documentation sections
3. **Create Detailed Issue**: Include:
   - Clear problem description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment information
   - Relevant logs and error messages
   - Diagnostic bundle if applicable

### Issue Template

When creating an issue, use this template:

```markdown
## Problem Description
Brief description of the issue.

## Environment
- Platform CDK8s Version:
- Node.js Version:
- Kubernetes Version:
- Operating System:

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Error Messages
```
Full error output here
```

## Additional Context
Any other relevant information.
```

### Escalation Path

For critical issues:

1. **Immediate**: Check this troubleshooting guide
2. **Within 1 hour**: Search existing issues and documentation
3. **Within 4 hours**: Create detailed GitHub issue
4. **Within 1 day**: Follow up on issue if no response
5. **Ongoing**: Provide additional information as requested

Remember to always test solutions in a development environment before applying them to production systems.
