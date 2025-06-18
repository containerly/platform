name: "✨ Add Kubernetes Operator"
description: "Request inclusion of a new operator (Flux, Grafana, Prometheus, etc.) in the platform template."
title: "[OPERATOR] <name> – <short purpose>"
labels:
  - enhancement
  - operator
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        ## 📝 Quick instructions  
        1. Fill in **all** required fields (marked with *)  
        2. If unsure about versions or values, link to upstream docs  
        3. Submit one operator per issue  

  - type: input
    id: operator_name
    attributes:
      label: "*Operator name"
      description: "e.g. grafana-operator, flux, prometheus-operator"
      placeholder: "grafana-operator"
    validations:
      required: true

  - type: input
    id: upstream_source
    attributes:
      label: "*Upstream source / registry URL"
      description: "Helm repo, OperatorHub bundle, or Git URL"
      placeholder: "https://github.com/grafana/grafana-operator"
    validations:
      required: true

  - type: dropdown
    id: platform_scope
    attributes:
      label: "*Platform(s) this operator belongs to"
      multiple: true
      options:
        - Core (cluster-level)
        - Data Platform
        - ML Platform
        - Observability
        - Other (describe below)
    validations:
      required: true

  - type: textarea
    id: problem
    attributes:
      label: "Problem / capability gap"
      description: "What limitation does the current platform have without this operator?"
      placeholder: "Our ML platform lacks built-in metric visualization…"
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: "Proposed solution"
      description: "How the operator solves the gap, including key CRDs and sample manifests."
      placeholder: |
        * CRDs introduced: Grafana, GrafanaDashboard  
        * Target namespace: observability  
        * Reconciler: Flux HelmRelease  
        * Example values.yaml…
    validations:
      required: true

  - type: textarea
    id: config_defaults
    attributes:
      label: "Default configuration / Helm values"
      description: "Attach or paste minimal sane defaults that should ship with the template."
      placeholder: |
        grafana:
          persistence:
            enabled: true
            size: 10Gi
    validations:
      required: false

  - type: textarea
    id: dependencies
    attributes:
      label: "Dependencies & ordering"
      description: "List any CRDs, operators, or platform components that must exist first."
      placeholder: "Depends on cert-manager v1.14+ for webhooks"
    validations:
      required: false

  - type: textarea
    id: testing
    attributes:
      label: "Testing / validation steps"
      description: "Describe how maintainers can verify the operator works once added."
      placeholder: |
        1. `kubectl apply -f examples/grafana-dashboard.yaml`
        2. Check Grafana pod logs for successful reconciliation…

  - type: textarea
    id: additional_context
    attributes:
      label: "Additional context"
      description: "Screenshots, diagrams, or links to design docs."
