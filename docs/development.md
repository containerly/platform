# Development

This document covers development workflows, coding standards, and best practices for the Platform CDK8s project.

## Development Environment

### Required Tools

- **Node.js** 18.x or 20.x (LTS versions)
- **npm** for package management
- **TypeScript** for type-safe development
- **Jest** for testing
- **CDK8s CLI** for manifest generation

### Editor Configuration

#### VS Code (Recommended)

Recommended extensions:
- TypeScript and JavaScript Language Features
- Jest Test Explorer
- Kubernetes Tools
- YAML Language Support

#### Settings

Add to your VS Code `settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

## Code Organization

### Project Structure

```
platform/
├── main.ts                 # Primary platform definition
├── main.test.ts            # Test specifications
├── imports/                # Generated CDK8s imports
│   └── operators.coreos.com/
├── types/                  # Custom type definitions (if needed)
└── utils/                  # Utility functions (if needed)
```

### Main Platform File

The `main.ts` file contains the core platform definition:

```typescript
import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import { OperatorGroup, Subscription } from './imports/operators.coreos.com';
import { Namespace } from 'cdk8s-plus-29';

export class Platform extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = {}) {
    super(scope, id, props);
    
    // Platform component definitions
  }
}

// Application instantiation
const app = new App();
new Platform(app, 'platform');
app.synth();
```

## Coding Standards

### TypeScript Guidelines

#### Type Safety

Always use explicit types when beneficial:

```typescript
// Good: Explicit interface
interface SubscriptionConfig {
  name: string;
  namespace: string;
  channel: string;
  source: string;
}

// Good: Explicit return type for complex functions
private createSubscription(config: SubscriptionConfig): Subscription {
  return new Subscription(this, config.name, {
    metadata: {
      name: config.name,
      namespace: config.namespace,
    },
    spec: {
      channel: config.channel,
      name: config.name,
      source: config.source,
      sourceNamespace: 'olm',
    },
  });
}
```

#### Naming Conventions

- **Classes**: PascalCase (`Platform`, `OperatorGroup`)
- **Variables**: camelCase (`subscriptionName`, `operatorConfig`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_NAMESPACE`, `OPERATOR_CATALOG`)
- **Files**: kebab-case (`operator-config.ts`, `platform-utils.ts`)

#### Import Organization

Organize imports in the following order:

```typescript
// 1. Node.js built-in modules
import * as path from 'path';

// 2. External libraries
import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';

// 3. Internal imports (generated)
import { OperatorGroup, Subscription } from './imports/operators.coreos.com';

// 4. Internal imports (custom)
import { PlatformConfig } from './types/platform-config';
```

### CDK8s Best Practices

#### Resource Naming

Use consistent naming patterns:

```typescript
// Pattern: component-purpose-type
new Subscription(this, 'grafana-subscription', {
  metadata: {
    name: 'grafana-subscription',
    namespace: 'operators',
  },
  // ...
});

// Pattern: component-operator-group
new OperatorGroup(this, 'prometheus-operator-group', {
  metadata: {
    name: 'prometheus-operator-group',
    namespace: 'default',
  },
  // ...
});
```

#### Configuration Management

Use constants for repeated values:

```typescript
const OPERATORS_NAMESPACE = 'operators';
const OLM_CATALOG_SOURCE = 'operatorhubio-catalog';
const OLM_SOURCE_NAMESPACE = 'olm';

new Subscription(this, 'prometheus-subscription', {
  metadata: {
    name: 'prometheus-subscription',
    namespace: OPERATORS_NAMESPACE,
  },
  spec: {
    channel: 'beta',
    name: 'prometheus',
    source: OLM_CATALOG_SOURCE,
    sourceNamespace: OLM_SOURCE_NAMESPACE,
  },
});
```

#### Resource Organization

Group related resources logically:

```typescript
export class Platform extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = {}) {
    super(scope, id, props);
    
    this.createNamespaces();
    this.createOperatorGroups();
    this.createObservabilityOperators();
    this.createGitOpsOperators();
    this.createMessagingOperators();
    this.createStorageOperators();
  }

  private createNamespaces(): void {
    // Namespace creation logic
  }

  private createOperatorGroups(): void {
    // Operator group creation logic
  }

  // ... other methods
}
```

## Testing Strategy

### Test Structure

Tests are organized using Jest with snapshot testing:

```typescript
import { Platform } from './main';
import { Testing } from 'cdk8s';

describe('Platform', () => {
  test('Should synthesize correctly', () => {
    const app = Testing.app();
    const chart = new Platform(app, 'test-chart');
    const results = Testing.synth(chart);
    expect(results).toMatchSnapshot();
  });
});
```

### Snapshot Testing

Snapshot tests ensure manifest consistency:

1. **Initial Creation**: First test run creates snapshot
2. **Regression Detection**: Subsequent runs compare against snapshot
3. **Intentional Changes**: Update snapshots when changes are intentional

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Update snapshots
npm test -- --updateSnapshot

# Run specific test file
npm test -- main.test.ts
```

### Adding New Tests

When adding new platform components:

```typescript
describe('Platform Components', () => {
  test('Should include all required operators', () => {
    const app = Testing.app();
    const chart = new Platform(app, 'test-chart');
    const results = Testing.synth(chart);
    
    // Verify specific operators exist
    expect(results).toContainEqual(
      expect.objectContaining({
        kind: 'Subscription',
        metadata: expect.objectContaining({
          name: 'prometheus-subscription'
        })
      })
    );
  });

  test('Should create required namespaces', () => {
    const app = Testing.app();
    const chart = new Platform(app, 'test-chart');
    const results = Testing.synth(chart);
    
    // Verify namespace creation
    expect(results).toContainEqual(
      expect.objectContaining({
        kind: 'Namespace',
        metadata: expect.objectContaining({
          name: 'flux-system'
        })
      })
    );
  });
});
```

## Build Process

### Development Build

```bash
# Install dependencies
npm ci

# Compile TypeScript
npm run compile

# Run tests
npm test

# Generate manifests
npm run synth

# Full build pipeline
npm run build
```

### Watch Mode

For active development:

```bash
# Watch TypeScript files
npm run watch

# In another terminal, run tests in watch mode
npm test -- --watch
```

### Manifest Generation

The synthesis process generates Kubernetes manifests:

```bash
npm run synth
```

Output location: `dist/platform.k8s.yaml`

## Development Workflow

### Feature Development

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-operator
   ```

2. **Implement Changes**
   - Update `main.ts` with new component
   - Add or update tests
   - Ensure TypeScript compilation succeeds

3. **Test Changes**
   ```bash
   npm run build
   ```

4. **Review Generated Manifests**
   ```bash
   cat dist/platform.k8s.yaml
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add new operator subscription"
   git push origin feature/new-operator
   ```

### Code Review Process

Before merging:

1. **Automated Checks**: CI pipeline validates build and tests
2. **Manifest Review**: Check generated YAML changes
3. **Code Review**: Peer review of TypeScript changes
4. **Documentation**: Update relevant documentation

### Hot Reload Development

For rapid iteration:

```bash
# Terminal 1: Watch for TypeScript changes
npm run watch

# Terminal 2: Auto-generate manifests on changes
# (requires additional tooling or manual re-run)
```

## Debugging

### Common Issues

#### TypeScript Compilation Errors

```bash
# Check TypeScript errors
npm run compile

# Common fixes:
# 1. Update import paths
# 2. Check type definitions
# 3. Verify CDK8s import generation
```

#### Test Failures

```bash
# Run tests with verbose output
npm test -- --verbose

# Update snapshots if changes are intentional
npm test -- --updateSnapshot
```

#### CDK8s Import Issues

```bash
# Regenerate CDK8s imports
npm run import

# Verify import configuration
cat cdk8s.yaml
```

### Debugging Techniques

#### Console Logging

Use console.log for debugging during development:

```typescript
export class Platform extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = {}) {
    super(scope, id, props);
    
    console.log('Creating platform with id:', id);
    
    // Component creation...
  }
}
```

#### Manifest Inspection

Examine generated manifests:

```bash
# Generate and view manifests
npm run synth && cat dist/platform.k8s.yaml | grep -A 10 -B 2 "kind: Subscription"
```

#### TypeScript Debugging

Use TypeScript's built-in debugging:

```typescript
// Enable sourceMap in tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true
  }
}
```

## Performance Optimization

### Build Performance

- Use `npm ci` instead of `npm install` for faster, deterministic installs
- Leverage TypeScript incremental compilation
- Cache node_modules in CI/CD pipelines

### Development Performance

- Use watch mode for active development
- Run specific tests instead of full suite during development
- Use TypeScript project references for large codebases

## Security Practices

### Dependency Management

- Regularly update dependencies using `npm audit`
- Use exact versions in package-lock.json
- Review security advisories for dependencies

### Code Security

- Avoid hardcoding sensitive values
- Use environment variables for configuration
- Validate input parameters

### Generated Manifest Security

- Review generated RBAC permissions
- Validate resource quotas and limits
- Check for security contexts in generated pods

## Troubleshooting Development Issues

### Node.js Version Issues

```bash
# Check Node.js version
node --version

# Use nvm for version management
nvm use 20
nvm install 20
```

### Package Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CDK8s Issues

```bash
# Update CDK8s to latest version
npm run upgrade

# Verify CDK8s configuration
cat cdk8s.yaml
```

## Contributing Guidelines

### Code Quality Checklist

Before submitting code:

- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Manifests generate successfully
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Commit messages follow convention

### Commit Message Format

Follow conventional commits:

```
type(scope): description

Examples:
feat(operators): add new monitoring operator
fix(build): resolve TypeScript compilation issue
docs(readme): update installation instructions
```

### Pull Request Process

1. Create feature branch from main
2. Implement changes following guidelines
3. Ensure all automated checks pass
4. Request review from maintainers
5. Address review feedback
6. Merge after approval

## Advanced Development Topics

### Custom CDK8s Constructs

Create reusable constructs for common patterns:

```typescript
export class OperatorSubscription extends Construct {
  constructor(scope: Construct, id: string, props: OperatorSubscriptionProps) {
    super(scope, id);
    
    new Subscription(this, 'subscription', {
      metadata: {
        name: props.name,
        namespace: props.namespace || 'operators',
      },
      spec: {
        channel: props.channel,
        name: props.packageName,
        source: props.source || 'operatorhubio-catalog',
        sourceNamespace: 'olm',
        installPlanApproval: props.autoApprove ? 'Automatic' : 'Manual',
      },
    });
  }
}
```

### Configuration Management

Use configuration files for environment-specific settings:

```typescript
interface PlatformConfig {
  operators: {
    [key: string]: {
      enabled: boolean;
      channel: string;
      namespace?: string;
    };
  };
}

const config: PlatformConfig = {
  operators: {
    prometheus: {
      enabled: true,
      channel: 'beta',
    },
    grafana: {
      enabled: true,
      channel: 'v5',
    },
  },
};
```

### Multi-Environment Support

Structure code for multiple deployment targets:

```typescript
export class Platform extends Chart {
  constructor(scope: Construct, id: string, props: PlatformProps = {}) {
    super(scope, id, props);
    
    const config = this.loadConfig(props.environment || 'default');
    this.createComponents(config);
  }

  private loadConfig(environment: string): PlatformConfig {
    // Load environment-specific configuration
  }
}
```