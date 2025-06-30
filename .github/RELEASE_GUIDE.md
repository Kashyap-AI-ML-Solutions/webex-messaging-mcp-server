# Release Guide for Webex MCP Server

This guide walks you through creating your first v0.1.0 release and setting up automated Docker Hub publishing.

## 🚀 Quick Start

### 1. Set Up Docker Hub Integration

Follow the detailed setup in [DOCKER_HUB_SETUP.md](./DOCKER_HUB_SETUP.md):

1. **Create Docker Hub access token**
2. **Add GitHub secrets:**
   - `DOCKER_HUB_USERNAME`: Your Docker Hub username
   - `DOCKER_HUB_TOKEN`: Your access token

### 2. Test Locally First

Before creating a release, ensure everything works:

```bash
# Run all tests
npm run validate

# Test Docker build
docker build -t webex-mcp-server:test .

# Test the built image
echo "WEBEX_PUBLIC_WORKSPACE_API_KEY=your-test-token" > .env.test
docker run --rm --env-file .env.test webex-mcp-server:test node index.js tools
```

### 3. Create Release (Option A: Using Script)

Use the provided release script:

```bash
# Make sure you're on main branch with clean working directory
git checkout main
git pull origin main

# Run the release script
./scripts/release.sh 0.1.0
```

### 4. Create Release (Option B: Manual)

If you prefer manual control:

```bash
# Ensure clean working directory
git status

# Update version (already done - package.json shows 0.1.0)
# Commit any final changes
git add .
git commit -m "chore: prepare for v0.1.0 release"

# Create and push tag
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

## 📋 What Happens During Release

### GitHub Actions Workflow

When you push a tag (e.g., `v0.1.0`), the CD workflow automatically:

1. **🧪 Runs Tests**
   - Executes all 118 unit tests
   - Runs linting and code quality checks
   - Generates test coverage report

2. **🐳 Builds Docker Image**
   - Multi-platform build (AMD64 + ARM64)
   - Uses Docker Buildx for cross-platform support
   - Optimized multi-stage build from Dockerfile

3. **📦 Publishes to Docker Hub**
   - Tags: `latest`, `0.1.0`, `v0.1.0`
   - Pushes to `YOUR_USERNAME/webex-mcp-server`
   - Generates build summary

### Expected Timeline

- **Tests**: ~2-3 minutes
- **Docker Build**: ~5-8 minutes
- **Docker Push**: ~2-3 minutes
- **Total**: ~10-15 minutes

## 🔍 Monitoring Your Release

### 1. GitHub Actions

Monitor progress at:
```
https://github.com/YOUR_USERNAME/webex-messaging-mcp-server/actions
```

### 2. Docker Hub

Check your published image at:
```
https://hub.docker.com/r/YOUR_USERNAME/webex-mcp-server
```

### 3. Workflow Status

The workflow will show:
- ✅ **Test job**: All tests pass
- ✅ **Build and Push job**: Image published successfully

## 🧪 Testing the Published Image

Once published, test your Docker image:

```bash
# Pull the image
docker pull YOUR_USERNAME/webex-mcp-server:0.1.0

# Test with your environment
docker run -i --rm --env-file .env YOUR_USERNAME/webex-mcp-server:0.1.0

# Test tool listing
echo "WEBEX_PUBLIC_WORKSPACE_API_KEY=your-token" > .env.test
docker run --rm --env-file .env.test YOUR_USERNAME/webex-mcp-server:0.1.0 node index.js tools
```

## 🔧 Troubleshooting

### Common Issues

1. **Tests Fail**
   ```bash
   # Run tests locally first
   npm run validate
   ```

2. **Docker Build Fails**
   ```bash
   # Test Docker build locally
   docker build -t test-image .
   ```

3. **Authentication Error**
   - Verify Docker Hub secrets are correct
   - Check token permissions (Read, Write, Delete)

4. **Tag Already Exists**
   ```bash
   # Delete tag if needed
   git tag -d v0.1.0
   git push origin :refs/tags/v0.1.0
   ```

### Debug Steps

1. **Check GitHub Actions logs** for detailed error messages
2. **Verify secrets** in repository settings
3. **Test locally** with same commands as workflow
4. **Check Docker Hub** for repository permissions

## 📈 Next Steps

After successful v0.1.0 release:

1. **Create release notes** on GitHub
2. **Update documentation** with new image tags
3. **Plan next version** (v0.1.1, v0.2.0, etc.)
4. **Monitor usage** on Docker Hub

## 🔄 Future Releases

For subsequent releases:

```bash
# For patch releases (bug fixes)
./scripts/release.sh 0.1.1

# For minor releases (new features)
./scripts/release.sh 0.2.0

# For major releases (breaking changes)
./scripts/release.sh 1.0.0
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [Semantic Versioning](https://semver.org/)
- [Docker Multi-platform Builds](https://docs.docker.com/build/building/multi-platform/)
