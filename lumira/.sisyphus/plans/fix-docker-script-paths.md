# Fix Docker Script Path Issues

## TL;DR
> The `start.sh` script fails because it doesn't ensure it's running from the correct directory. Fix by adding `cd` to script directory at the start.

## Context

The user moved Docker files to the `docker/` folder, but the `start.sh` script assumes it's being run from the docker directory. When users run the script from elsewhere (e.g., project root), docker-compose can't find the `docker-compose.yml` file.

Error message:
```
no configuration file provided: not found
```

## Problem Analysis

The script calls `docker-compose up -d --build` without:
1. Changing to the script's directory first
2. Specifying the compose file path with `-f`

This causes the script to fail when run from any directory other than `docker/`.

## Solution

Add directory detection and change to script directory at the beginning of both `start.sh` and `stop.sh`.

### Fix for start.sh

Add after `#!/bin/bash`:
```bash
# Change to script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
```

### Fix for stop.sh

Same fix as start.sh.

## Files to Modify

- `docker/start.sh` - Add directory change logic
- `docker/stop.sh` - Add directory change logic

## Verification Steps

1. Run `./docker/start.sh` from project root - should work
2. Run `cd docker && ./start.sh` - should work
3. Run `./docker/stop.sh` from project root - should work
4. Verify all containers start correctly

## Success Criteria

- [ ] Script works when run from any directory
- [ ] All 4 containers start successfully
- [ ] Script can be run as `./docker/start.sh` from project root
