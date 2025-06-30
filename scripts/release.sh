#!/bin/bash

# Release script for Webex MCP Server
# Usage: ./scripts/release.sh [version]
# Example: ./scripts/release.sh 0.1.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if version is provided
if [ $# -eq 0 ]; then
    print_error "Version number is required"
    echo "Usage: $0 <version>"
    echo "Example: $0 0.1.0"
    exit 1
fi

VERSION=$1
TAG="v$VERSION"

# Validate version format (basic semver check)
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    print_error "Invalid version format. Use semantic versioning (e.g., 0.1.0)"
    exit 1
fi

print_status "Starting release process for version $VERSION"

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "You're not on the main branch (current: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Release cancelled"
        exit 1
    fi
fi

# Check if working directory is clean
if ! git diff-index --quiet HEAD --; then
    print_error "Working directory is not clean. Please commit or stash changes."
    exit 1
fi

# Check if tag already exists
if git tag -l | grep -q "^$TAG$"; then
    print_error "Tag $TAG already exists"
    exit 1
fi

# Update package.json version
print_status "Updating package.json version to $VERSION"
npm version $VERSION --no-git-tag-version

# Run tests
print_status "Running tests..."
npm run validate

# Commit version bump
print_status "Committing version bump"
git add package.json
git commit -m "chore: bump version to $VERSION"

# Create and push tag
print_status "Creating tag $TAG"
git tag -a $TAG -m "Release $TAG"

print_status "Pushing changes and tag to origin"
git push origin $CURRENT_BRANCH
git push origin $TAG

print_success "Release $TAG created successfully!"
print_status "GitHub Actions will now:"
echo "  1. Run all tests"
echo "  2. Build Docker image for multiple platforms"
echo "  3. Push to Docker Hub with tags: latest, $VERSION, $TAG"
echo ""
print_status "Monitor the progress at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
echo ""
print_status "Once published, the image will be available as:"
echo "  docker pull YOUR_USERNAME/webex-mcp-server:$VERSION"
