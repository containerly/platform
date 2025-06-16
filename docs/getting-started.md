# Getting Started

This guide will help you set up your development environment and get familiar with the Platform CDK8s project.

## Prerequisites

### Required Software

Ensure you have the following software installed:

- **Node.js** (version 18.x or 20.x)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **npm** (comes with Node.js)
  - Verify installation: `npm --version`

- **Git**
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

### Optional Tools

- **kubectl** - For interacting with Kubernetes clusters
- **Docker** - For containerized development
- **VS Code** - Recommended editor with TypeScript support

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/containerly/platform.git
cd platform
```

### 2. Install Dependencies

```bash
npm ci
```

This command installs exact versions of dependencies as specified in `package-lock.json`.

### 3. Verify Installation

Run the build process to ensure everything is working:

```bash
npm run build
```

This command will:
- Compile TypeScript code
- Run tests
- Generate Kubernetes manifests

### 4. Configure GitHub Packages (Optional)

If you plan to consume this package in other projects:

```bash
# Configure npm to use GitHub Packages for @containerly scope
npm config set @containerly:registry https://npm.pkg.github.com

# Authenticate with GitHub (requires personal access token)
npm login --scope=@containerly --registry=https://npm.pkg.github.com
```

## Project Structure Overview

Understanding the project layout:

```
platform/
├── main.ts                 # Main platform definition
├── main.test.ts            # Test file with snapshot testing
├── package.json            # Node.js project configuration
├── tsconfig.json           # TypeScript compiler configuration
├── jest.config.js          # Test framework configuration
├── cdk8s.yaml              # CDK8s project configuration
├── .github/workflows/      # CI/CD pipeline definitions
│   ├── ci.yml              # Continuous integration
│   ├── pr.yml              # Pull request validation
│   └── release.yml         # Automated releases
├── script/                 # Operational scripts
│   ├── install             # Deploy platform to Kubernetes
│   ├── delete              # Remove platform from Kubernetes
│   ├── import              # Import Kubernetes API definitions
│   └── olm                 # Install Operator Lifecycle Manager
├── imports/                # Generated CDK8s type definitions
├── dist/                   # Generated Kubernetes manifests
└── docs/                   # Documentation source files
```

## Available Commands

### Development Commands

| Command | Description |
|---------|-------------|
| `npm ci` | Install dependencies (exact versions) |
| `npm install` | Install/update dependencies |
| `npm run compile` | Compile TypeScript to JavaScript |
| `npm run watch` | Watch for changes and recompile |
| `npm test` | Run test suite |
| `npm run build` | Full build (compile + test + synth) |
| `npm run synth` | Generate Kubernetes manifests |

### Operational Scripts

| Script | Description |
|---------|-------------|
| `./script/install` | Deploy platform to Kubernetes cluster |
| `./script/delete` | Remove platform from Kubernetes cluster |
| `./script/olm` | Install Operator Lifecycle Manager |
| `./script/import` | Import Kubernetes CRD definitions |

## First Steps

### 1. Examine the Platform Definition

Open `main.ts` to see how the platform components are defined:

```typescript
export class Platform extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);
    
    // Platform components are defined here
    // Each operator has its own subscription and configuration
  }
}
```

### 2. Run Tests

Execute the test suite to understand expected behavior:

```bash
npm test
```

The tests use snapshot testing to ensure generated manifests remain consistent.

### 3. Generate Manifests

Create Kubernetes manifests from the TypeScript definitions:

```bash
npm run synth
```

This creates `dist/platform.k8s.yaml` containing all Kubernetes resources.

### 4. Examine Generated Output

Review the generated manifest:

```bash
cat dist/platform.k8s.yaml
```

This file contains all the Kubernetes resources needed to deploy the platform.

## Development Workflow

### Making Changes

1. **Edit the platform definition** in `main.ts`
2. **Compile** with `npm run compile`
3. **Test** with `npm test`
4. **Generate manifests** with `npm run synth`
5. **Review changes** in `dist/platform.k8s.yaml`

### Testing Changes

Before deploying to a cluster, always:

1. Run the full build: `npm run build`
2. Review test results and generated manifests
3. Validate against your target Kubernetes environment

### Common Development Tasks

#### Adding a New Operator

1. Add the subscription definition in `main.ts`
2. Update tests if needed
3. Regenerate manifests
4. Test in a development cluster

#### Modifying Configuration

1. Update the relevant configuration in `main.ts`
2. Verify tests still pass
3. Check generated manifest changes
4. Document breaking changes

## Next Steps

Great! You now have the Platform CDK8s development environment ready. Here's your progressive learning path:

### :mag: **Understanding the Platform** (5-10 minutes)
- **[Architecture Overview](architecture.md)** - Learn how all components work together
- **[Platform Components](flux/index.md)** - Explore individual platform capabilities

### :construction_worker: **Development Workflows** (10-15 minutes)  
- **[Development Guide](development.md)** - Coding standards, testing, and build processes
- **[Contributing Guide](contributing.md)** - How to submit changes and improvements

### :rocket: **Deployment & Operations** (15-20 minutes)
- **[Operations Guide](operations.md)** - Deploy and manage the platform
- **[Troubleshooting](troubleshooting.md)** - Handle common issues

### :books: **Deep Dive** (As needed)
- **[Flux GitOps](flux/index.md)** - Continuous deployment workflows
- **[Observability](observability/index.md)** - Monitoring and metrics
- **[Messaging](messaging/index.md)** - Event streaming with Kafka
- **[API Reference](api-reference.md)** - Complete technical reference

---

## Getting Help

If you encounter issues during setup:

1. **:mag: Quick Check**: [Troubleshooting Guide](troubleshooting.md) - Common issues and solutions
2. **:octocat: Community**: [GitHub Issues](https://github.com/containerly/platform/issues) - Existing known issues
3. **:question: Report Issue**: Create a new issue with:
   - Your operating system and Node.js version
   - Complete error messages and stack traces
   - Steps to reproduce the problem

## Environment Variables

### CI/CD Environment

The following environment variables are used in CI/CD pipelines:

- `GITHUB_TOKEN` - Required for publishing packages and creating releases
- `NODE_AUTH_TOKEN` - Set automatically for npm authentication

### Local Development

No special environment variables are required for local development.