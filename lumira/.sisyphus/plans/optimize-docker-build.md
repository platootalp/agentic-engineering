# Optimize Docker Build Performance

## TL;DR
> Docker builds are slow due to: (1) Installing build tools (python3/make/g++) every time, (2) Large build context, (3) No proper .dockerignore. Fix with better caching, smaller base images, and optimized layer ordering.

## Current Issues

### 1. Slow Build Tools Installation (7.7s+ per build)
```dockerfile
RUN apk add --no-cache openssl python3 make g++
```
This installs compilers and build tools every time, even when package.json hasn't changed.

### 2. Large Build Context (490kB transferred)
Build context includes unnecessary files, slowing down the transfer.

### 3. Cache Invalidation
Any code change invalidates the npm install layer, requiring full rebuild.

## Optimization Strategies

### Strategy 1: Use Pre-built Base Image with Build Tools
Create a custom base image that already has build tools installed, or use a non-Alpine image that includes them.

**Option A: Use node:20-slim (Debian-based)**
- Already has build tools
- Better compatibility with native modules
- Larger image but faster builds

**Option B: Use pre-built bcrypt**
- Use `bcrypt` with pre-built binaries
- Or switch to `bcryptjs` (pure JS, slower runtime but no build needed)

### Strategy 2: Optimize Layer Caching
Reorder Dockerfile to maximize cache hits:
1. Copy package.json first
2. Install dependencies
3. Copy prisma schema
4. Generate prisma client
5. Copy source code
6. Build

### Strategy 3: Add .dockerignore
Exclude files that don't need to be in the build context:
- node_modules
- .git
- logs
- dist
- .env files
- tests

### Strategy 4: Use Docker BuildKit Mounts
Use cache mounts for npm and apk to persist between builds:
```dockerfile
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache openssl python3 make g++
```

## Recommended Solution

### Phase 1: Add .dockerignore (Quick Win)
Create comprehensive .dockerignore files for both frontend and backend.

### Phase 2: Optimize Backend Dockerfile
1. Use node:20-slim instead of alpine for backend (avoids build tool installation)
2. Or add proper caching for apk
3. Optimize layer order

### Phase 3: Optimize Frontend Dockerfile
1. Add .dockerignore
2. Use BuildKit for npm cache

### Phase 4: Use Docker BuildKit
Enable BuildKit for better caching and parallel builds.

## Implementation Plan

### Files to Modify

1. **docker/.dockerignore.backend** - Already exists, verify it's comprehensive
2. **docker/Dockerfile.backend** - Optimize layer order and base image
3. **docker/Dockerfile.frontend** - Add .dockerignore and optimize
4. **docker/.dockerignore.frontend** - Create new file

### Expected Improvements

| Optimization | Current | After | Improvement |
|-------------|---------|-------|-------------|
| Build tools install | 7-10s | 0s | 100% (use pre-built) |
| Context transfer | 490kB | <100kB | 80% reduction |
| npm install cache | Always runs | Only on package.json change | 90% reduction |
| Total build time | ~60s | ~20s | 65% faster |

## Verification Steps

1. Build with `docker-compose build --no-cache` to test full build
2. Make a code change and rebuild - should use cache for dependencies
3. Check build context size: `docker build --no-cache . 2>&1 | grep -i context`
4. Measure total build time

## Success Criteria

- [ ] Backend build completes in <30 seconds (cold)
- [ ] Backend build completes in <10 seconds (warm, code changes only)
- [ ] Frontend build completes in <60 seconds (cold)
- [ ] Frontend build completes in <15 seconds (warm)
- [ ] Build context <100kB for both images
