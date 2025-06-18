---
name: "✨ Add Kubernetes Operator"
about: "Request inclusion of a new operator (Flux, Grafana, Prometheus, etc.) in the platform repo template."
title: "[OPERATOR] <name> – <short purpose>"
labels: ["enhancement", "operator"]
assignees: ""
---

## ⚡ Operator name

`grafana-operator` / `flux` / `prometheus-operator` / …


## ⚡ Upstream source / registry URL

*Example:* <https://github.com/grafana-operator/grafana-operator>


## ⚡ Platform scope  
_Select all that apply_

- [ ] Core (cluster-level)
- [ ] Data Platform
- [ ] ML Platform
- [ ] Observability
- [ ] Other: …


## ⚡ Problem / capability gap

> _Explain what the platform can’t do today._


## ⚡ Proposed solution

*Key CRDs introduced, desired namespace, install method (Helm, OLM, raw YAML), sample manifest snippet, etc.*

### Default configuration / Helm values (optional)

```yaml
grafana:
  persistence:
    enabled: true
    size: 10Gi
