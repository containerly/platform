# Contributing

Thank you for your interest in contributing to the Platform CDK8s project. This guide outlines the process for contributing code, documentation, and other improvements.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Completed the [Getting Started](getting-started.md) setup
- Read the [Development](development.md) guidelines
- Reviewed the [Architecture](architecture.md) documentation
- Familiarized yourself with the existing codebase

### Code of Conduct

This project follows the GitHub Community Guidelines. All contributors are expected to:

- Be respectful and inclusive in all interactions
- Focus on constructive feedback and discussions
- Help maintain a welcoming environment for all contributors
- Report any unacceptable behavior to project maintainers

## Contribution Types

### Code Contributions

- **Bug Fixes**: Resolve existing issues or problems
- **Feature Additions**: Add new operators or platform capabilities
- **Performance Improvements**: Optimize build times or resource usage
- **Code Quality**: Refactor code for better maintainability

### Documentation Contributions

- **API Documentation**: Improve code comments and type definitions
- **User Guides**: Enhance getting started and operational procedures
- **Architecture Documentation**: Clarify system design and decisions
- **Troubleshooting**: Add solutions for common issues

### Testing Contributions

- **Test Coverage**: Add tests for untested code paths
- **Test Quality**: Improve existing test reliability
- **Integration Tests**: Add end-to-end testing scenarios
- **Performance Tests**: Add benchmarking and load testing

## Development Process

### Setting Up Your Development Environment

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/platform.git
   cd platform
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/containerly/platform.git
   ```

3. **Install Dependencies**
   ```bash
   npm ci
   ```

4. **Verify Setup**
   ```bash
   npm run build
   ```

### Branch Strategy

Use descriptive branch names with the following prefixes:

- `feature/` - New features or enhancements
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or improvements

Examples:
```bash
git checkout -b feature/add-istio-operator
git checkout -b fix/prometheus-subscription-channel
git checkout -b docs/update-deployment-guide
```

### Making Changes

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the [Development](development.md) guidelines
   - Write tests for new functionality
   - Update documentation as needed
   - Ensure TypeScript compilation succeeds

3. **Test Your Changes**
   ```bash
   npm run build
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new operator subscription"
   ```

### Commit Message Guidelines

Follow the Conventional Commits specification:

#### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

#### Scopes (Optional)
- `operators`: Changes to operator definitions
- `build`: Changes to build configuration
- `ci`: Changes to CI configuration
- `docs`: Documentation changes
- `test`: Test-related changes

#### Examples
```bash
# Feature addition
git commit -m "feat(operators): add Istio service mesh operator"

# Bug fix
git commit -m "fix(build): resolve TypeScript compilation error"

# Documentation update
git commit -m "docs: add troubleshooting guide for OLM issues"

# Breaking change
git commit -m "feat(operators)!: upgrade Prometheus operator to v2"
```

#### Breaking Changes

For breaking changes, use either:
- Exclamation mark after type: `feat!:`
- Footer with `BREAKING CHANGE:` prefix

```bash
git commit -m "feat(operators)!: upgrade Kafka operator

BREAKING CHANGE: Kafka operator v2 requires migration of existing topics"
```

### Pull Request Process

#### Before Submitting

1. **Sync with Upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run Full Test Suite**
   ```bash
   npm run build
   ```

3. **Review Your Changes**
   ```bash
   git diff upstream/main
   ```

#### Submitting the Pull Request

1. **Push Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Navigate to GitHub and create a pull request
   - Use the pull request template
   - Provide clear description of changes
   - Link related issues using keywords (Fixes #123)

#### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass (if applicable)
- [ ] Manual testing completed

## Documentation
- [ ] Code is self-documenting
- [ ] Documentation updated (if applicable)
- [ ] CHANGELOG updated (if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Tests added for new functionality
- [ ] All automated checks pass
```

#### Review Process

1. **Automated Checks**: CI pipeline validates build and tests
2. **Code Review**: Maintainers review code quality and design
3. **Documentation Review**: Check for documentation updates
4. **Manual Testing**: Test changes in development environment
5. **Approval**: At least one maintainer approval required

#### Addressing Review Feedback

1. **Make Requested Changes**
   ```bash
   # Make changes based on feedback
   git add .
   git commit -m "fix: address review feedback"
   ```

2. **Update Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Respond to Comments**: Address each review comment

## Code Standards

### Quality Requirements

All contributions must meet these standards:

- **TypeScript Compilation**: Code must compile without errors
- **Test Coverage**: New features require corresponding tests
- **Documentation**: Public APIs must be documented
- **Style Consistency**: Follow existing code patterns
- **Performance**: Changes should not significantly impact build times

### Code Review Criteria

Reviewers evaluate submissions based on:

- **Correctness**: Code works as intended
- **Security**: No security vulnerabilities introduced
- **Performance**: Reasonable resource usage
- **Maintainability**: Code is readable and well-structured
- **Testing**: Adequate test coverage provided
- **Documentation**: Changes are properly documented

## Issue Reporting

### Bug Reports

When reporting bugs, include:

1. **Clear Title**: Descriptive summary of the issue
2. **Environment**: Node.js version, operating system, Kubernetes version
3. **Steps to Reproduce**: Detailed reproduction steps
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Error Messages**: Full error output
7. **Additional Context**: Screenshots, logs, or other relevant information

### Feature Requests

When requesting features, include:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: How should this be implemented?
3. **Alternatives**: Other solutions considered
4. **Additional Context**: Use cases, examples, or mockups

### Issue Templates

Use GitHub issue templates when available:

- **Bug Report Template**: For reporting bugs
- **Feature Request Template**: For requesting new features
- **Documentation Issue Template**: For documentation problems

## Release Process

### Version Management

The project uses semantic versioning:

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, backward compatible

### Automated Releases

Releases are automated based on commit messages:

1. **Commit to Main**: Changes merged to main branch
2. **Version Calculation**: Semantic version determined from commits
3. **Package Publication**: NPM package published to GitHub Packages
4. **GitHub Release**: Release created with generated manifests
5. **Documentation Update**: Documentation deployed (if applicable)

### Release Schedule

- **Regular Releases**: Automated on every merge to main
- **Hotfix Releases**: As needed for critical bug fixes
- **Major Releases**: Planned for breaking changes

## Community Guidelines

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community discussions
- **Pull Requests**: Code review and collaboration

### Getting Help

If you need assistance:

1. **Search Existing Issues**: Check if your question has been asked
2. **Review Documentation**: Check all documentation sections
3. **Create New Issue**: Use appropriate issue template
4. **Provide Context**: Include relevant details and examples

### Recognition

Contributors are recognized through:

- **Git History**: All contributions are recorded in git history
- **Release Notes**: Significant contributions mentioned in releases
- **GitHub Contributors**: Listed on repository contributors page

## Advanced Contributing

### Becoming a Maintainer

Regular contributors may be invited to become maintainers based on:

- **Consistent Contributions**: Regular, high-quality contributions
- **Code Review Participation**: Helping review other contributions
- **Community Support**: Helping other contributors and users
- **Technical Expertise**: Deep understanding of the codebase

### Maintainer Responsibilities

Maintainers are expected to:

- **Review Pull Requests**: Provide timely, constructive feedback
- **Manage Issues**: Triage, label, and respond to issues
- **Release Management**: Coordinate releases and version management
- **Community Leadership**: Foster a welcoming contributor community

### Project Governance

- **Decision Making**: Consensus-based decisions among maintainers
- **Conflict Resolution**: Open discussion and compromise
- **Technical Direction**: Community input on major technical decisions

## Security Considerations

### Reporting Security Issues

For security vulnerabilities:

1. **Do Not Create Public Issues**: Use GitHub Security Advisories
2. **Provide Details**: Clear description of vulnerability
3. **Include Proof of Concept**: If applicable and safe
4. **Coordinate Disclosure**: Work with maintainers on timeline

### Security Review Process

Security-related changes receive additional scrutiny:

- **Extended Review Period**: More time for thorough review
- **Multiple Reviewers**: At least two maintainer reviews
- **Security Testing**: Additional security-focused testing
- **Documentation**: Security implications documented

## Legal and Licensing

### License Agreement

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

### Copyright

- **Contribution Ownership**: You retain copyright of your contributions
- **License Grant**: You grant the project rights to use your contributions
- **Third-Party Code**: Ensure you have rights to contribute any third-party code

### Compliance

Ensure contributions comply with:

- **Open Source Licenses**: Compatible with project license
- **Export Control Laws**: No restricted technology
- **Corporate Policies**: Your employer's contribution policies

## Conclusion

Contributing to the Platform CDK8s project is a great way to learn about Kubernetes, operators, and infrastructure as code. Whether you are fixing bugs, adding features, or improving documentation, your contributions help make the project better for everyone.

Thank you for taking the time to contribute to this project. If you have any questions about the contribution process, please create an issue or reach out to the maintainers.