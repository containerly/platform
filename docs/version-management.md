# Version Management

This document describes the automated and manual version management system for the Platform CDK8s project.

## Automated Version Bumping

### Release Workflow

The project uses an automated release workflow (`.github/workflows/release.yml`) that triggers on every push to the `main` branch. The workflow:

1. **Analyzes commit messages** to determine the appropriate version bump:
   - `feat!:` or `BREAKING CHANGE:` or `[major]` → Major version bump (1.0.0 → 2.0.0)
   - `feat:` or `[minor]` → Minor version bump (1.0.0 → 1.1.0)
   - `fix:` or `perf:` or `[patch]` → Patch version bump (1.0.0 → 1.0.1)
   - **Default**: All other commits → Patch version bump

2. **Updates** `package.json` and `package-lock.json` with the new version
3. **Commits** the version changes back to the repository
4. **Publishes** the package to GitHub Packages
5. **Creates** a GitHub release with generated manifests

### Scheduled Patch Bumps

An additional workflow (`.github/workflows/scheduled-patch-bump.yml`) runs weekly to automatically bump the patch version if:

- No commits have been made in the last 7 days
- This ensures regular maintenance releases

The scheduled workflow can also be triggered manually via the GitHub Actions UI.

## Manual Version Management

### Using the Version Bump Script

You can also use the version bump script directly:

```bash
# Basic usage
./script/version-bump patch
./script/version-bump minor
./script/version-bump major

# With custom commit message
./script/version-bump patch "fix: resolve critical bug in operator deployment"
```

The script will:
1. Validate the working directory is clean
2. Display current version
3. Bump the version using `npm version`
4. Stage the changes (package.json and package-lock.json)
5. Create an appropriate commit message
6. Commit the changes
7. Provide instructions for pushing

### Manual Release Process

If you need to create a release manually:

1. **Bump the version** using one of the methods above
2. **Push to main** to trigger the automated release workflow:
   ```bash
   git push origin main
   ```

## Version Numbering Strategy

The project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes or breaking changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes and maintenance

## Commit Message Conventions

To ensure proper automated version bumping, use these commit message conventions:

### Major Version Bump
```
feat!: implement new operator architecture

BREAKING CHANGE: The operator subscription API has changed
```

### Minor Version Bump
```
feat: add support for MinIO operator
feat(grafana): add custom dashboard configurations
```

### Patch Version Bump
```
fix: resolve operator startup timeout issue
fix(prometheus): correct service monitor configuration
perf: optimize CDK8s synthesis performance
```

### Maintenance Commits (Patch Bump)
```
docs: update installation instructions
chore: update dependencies
style: fix code formatting
test: add unit tests for new operator
```

## Troubleshooting

### Release Workflow Not Triggering

If the automated release doesn't trigger:

1. Check that the commit was pushed to the `main` branch
2. Verify the workflow file syntax is correct
3. Check GitHub Actions logs for errors
4. Ensure repository has proper permissions for the workflow

### Version Bump Script Issues

If the version bump script fails:

1. Ensure working directory is clean: `git status`
2. Make sure you're on the correct branch
3. Verify the script has execute permissions: `chmod +x script/version-bump`
4. Check Node.js and npm are properly installed

### Package Publishing Issues

If package publishing fails:

1. Verify GitHub Packages permissions are configured
2. Check that `NODE_AUTH_TOKEN` is properly set in the workflow
3. Ensure package name and scope are correct in `package.json`

## Best Practices

1. **Use descriptive commit messages** that follow the conventions
2. **Test changes locally** before pushing to main
3. **Use feature branches** for development, merge to main for releases
4. **Review generated releases** to ensure they contain expected content
5. **Monitor the Actions tab** for workflow execution status
