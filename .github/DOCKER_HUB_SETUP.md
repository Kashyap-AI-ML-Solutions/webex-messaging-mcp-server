# Docker Hub Integration Setup

This document explains how to set up automated Docker image publishing to Docker Hub using GitHub Actions.

## Prerequisites

1. **Docker Hub Account**: You need a Docker Hub account
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Repository Secrets**: You'll need to configure GitHub secrets

## Step 1: Create Docker Hub Access Token

1. Go to [Docker Hub](https://hub.docker.com/)
2. Sign in to your account
3. Click on your username in the top right corner
4. Select **Account Settings**
5. Go to **Security** tab
6. Click **New Access Token**
7. Give it a descriptive name (e.g., "GitHub Actions - webex-mcp-server")
8. Select **Read, Write, Delete** permissions
9. Click **Generate**
10. **Copy the token immediately** (you won't be able to see it again)

## Step 2: Configure GitHub Repository Secrets

1. Go to your GitHub repository
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add the following secrets:

### Required Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `DOCKER_HUB_USERNAME` | Your Docker Hub username | `yourusername` |
| `DOCKER_HUB_TOKEN` | The access token from Step 1 | `dckr_pat_abc123...` |

## Step 3: Update Workflow Configuration

The workflow is already configured to use your Docker Hub username from secrets. The image will be published as:

```
docker.io/YOUR_USERNAME/webex-mcp-server:VERSION
```

## Step 4: Create Your First Release

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Add GitHub Actions CI/CD workflows"
   git push origin main
   ```

2. **Create and push a version tag:**
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

3. **Monitor the workflow:**
   - Go to your GitHub repository
   - Click the **Actions** tab
   - Watch the "Continuous Deployment" workflow run

## What Happens When You Create a Tag

1. **Tests Run**: All 118 unit tests are executed
2. **Docker Build**: Multi-platform image is built (AMD64 + ARM64)
3. **Docker Push**: Image is pushed to Docker Hub with multiple tags:
   - `latest`
   - `0.1.0` (version number)
   - `v0.1.0` (full tag)

## Using the Published Image

Once published, anyone can use your Docker image:

```bash
# Pull the latest version
docker pull YOUR_USERNAME/webex-mcp-server:latest

# Pull a specific version
docker pull YOUR_USERNAME/webex-mcp-server:0.1.0

# Run the container
docker run -i --rm --env-file .env YOUR_USERNAME/webex-mcp-server:latest
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify your Docker Hub username and token are correct
   - Make sure the token has write permissions
   - Check that secrets are properly set in GitHub

2. **Build Failed**
   - Check the GitHub Actions logs
   - Ensure all tests pass locally first
   - Verify Dockerfile syntax

3. **Push Failed**
   - Confirm Docker Hub repository exists or can be created
   - Check Docker Hub storage limits
   - Verify network connectivity

### Debugging Steps

1. **Check workflow logs** in GitHub Actions tab
2. **Test locally** with the same commands:
   ```bash
   npm test
   docker build -t test-image .
   ```
3. **Verify secrets** are set correctly in repository settings

## Security Best Practices

1. **Use Access Tokens**: Never use your Docker Hub password
2. **Limit Token Scope**: Only grant necessary permissions
3. **Rotate Tokens**: Regularly update access tokens
4. **Monitor Usage**: Check Docker Hub for unexpected activity

## Next Steps

After successful setup:
1. Create additional tags for new releases
2. Consider setting up automated releases
3. Add release notes and changelogs
4. Monitor image usage and downloads
