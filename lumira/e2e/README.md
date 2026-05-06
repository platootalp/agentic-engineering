# E2E Testing Guide

This directory contains the Playwright E2E test suite for Lumira 基金投资助手.

## Overview

- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Pattern**: Page Object Model (POM)

## Quick Start

```bash
# Run all E2E tests
npm run e2e

# Run with UI mode
npm run e2e:ui

# Run in headed mode
npm run e2e:headed

# Run specific test file
npx playwright test e2e/dashboard.spec.ts
```

## Test Structure

- `pages/` - Page Object Models
- `utils/` - Test utilities
- `*.spec.ts` - Test files

## Test Files

| File | Description |
|------|-------------|
| smoke.spec.ts | Basic smoke tests |
| dashboard.spec.ts | Dashboard page tests |
| holdings.spec.ts | Holdings management tests |
| navigation.spec.ts | Navigation flow tests |
| import.spec.ts | Import page tests |
| compare.spec.ts | Compare page tests |
| rankings.spec.ts | Rankings page tests |
| sip.spec.ts | SIP calculator tests |
