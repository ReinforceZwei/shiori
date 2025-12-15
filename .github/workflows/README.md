# Docker Build Workflow

This GitHub Actions workflow automatically builds and publishes Docker images to GitHub Container Registry (GHCR).

## Image Naming Convention

The workflow publishes two separate images with synchronized version tags:

### App Image
- **Image Name**: `ghcr.io/{owner}/{repo}`
- **Tags**: 
  - `{version}` (e.g., `1.0.0`, `main-abc1234`)
  - `latest` (only for version tag releases)

### Migrate Image
- **Image Name**: `ghcr.io/{owner}/{repo}-migrate`
- **Tags**:
  - `{version}` (e.g., `1.0.0`, `main-abc1234`)
  - `latest` (only for version tag releases)

## Triggers

### 1. Version Tag Push
Push a tag starting with `v` to trigger a release build:
```bash
git tag v1.0.0
git push origin v1.0.0
```

**Published Images**:
- `ghcr.io/{owner}/{repo}:1.0.0`
- `ghcr.io/{owner}/{repo}:latest`
- `ghcr.io/{owner}/{repo}-migrate:1.0.0`
- `ghcr.io/{owner}/{repo}-migrate:latest`

### 2. Manual Dispatch (Testing)
Go to Actions → Build and Push Docker Images → Run workflow

**Published Images** (example for `main` branch):
- `ghcr.io/{owner}/{repo}:main-abc1234`
- `ghcr.io/{owner}/{repo}-migrate:main-abc1234`

Note: Manual builds do NOT update the `latest` tag.

## Smart Migrate Image Handling

### When Database Changes
- Detected by comparing `prisma/schema.prisma` and `prisma/migrations/` against previous tag
- Builds new migrate image from `Dockerfile.migrate`

### When Database Unchanged
- Reuses existing migrate image by creating a new tag pointing to the previous image
- No rebuild, no duplicate storage
- Fallback: Builds new image if previous one doesn't exist

## Deployment

### Using docker-compose.prod.yml

Set environment variables:
```bash
export VERSION=1.0.0  # or use latest
export GITHUB_REPOSITORY=owner/repo
export DB_PASSWORD=secure_password
export BETTER_AUTH_SECRET=your_secret
export BETTER_AUTH_URL=https://your-domain.com
```

Deploy:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Using docker CLI

Pull images:
```bash
docker pull ghcr.io/{owner}/{repo}:1.0.0
docker pull ghcr.io/{owner}/{repo}-migrate:1.0.0
```

Run migration:
```bash
docker run --rm \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  ghcr.io/{owner}/{repo}-migrate:1.0.0
```

Run app:
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e BETTER_AUTH_SECRET=your_secret \
  -e BETTER_AUTH_URL=https://your-domain.com \
  ghcr.io/{owner}/{repo}:1.0.0
```

## Examples

### Scenario 1: First Release (v1.0.0)
- Builds both app and migrate images
- Tags: `1.0.0` and `latest` for both

### Scenario 2: Code-only Update (v1.0.1)
- DB unchanged → reuses `migrate:1.0.0`
- Builds new app image
- Creates `app-migrate:1.0.1` pointing to same image as `app-migrate:1.0.0`
- Updates `latest` tags for both

### Scenario 3: Database Schema Change (v1.1.0)
- DB changed → builds new migrate image
- Builds new app image
- Updates `latest` tags for both

### Scenario 4: Feature Branch Testing
- Manual dispatch on `feature-auth` branch (SHA: abc1234)
- Tags: `feature-auth-abc1234` for both images
- Does NOT affect `latest` tags

