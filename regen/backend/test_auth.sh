#!/bin/bash

# Test script for authentication endpoints
# Usage: ./test_auth.sh

BASE_URL="http://localhost:8000"

echo "=== Testing Authentication API ==="
echo ""

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s "${BASE_URL}/health" | jq .
echo ""

# Test 2: Register a new user
echo "2. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }')
echo "$REGISTER_RESPONSE" | jq .
echo ""

# Extract tokens from registration response
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.tokens.access_token // empty')
REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.tokens.refresh_token // empty')

if [ -n "$ACCESS_TOKEN" ]; then
  echo "✓ Registration successful!"
  echo ""

  # Test 3: Login with the new user
  echo "3. Testing user login..."
  LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "password123"
    }')
  echo "$LOGIN_RESPONSE" | jq .
  echo ""

  # Test 4: Get current user
  echo "4. Testing get current user (/api/v1/auth/me)..."
  curl -s "${BASE_URL}/api/v1/auth/me" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" | jq .
  echo ""

  # Test 5: Refresh token
  echo "5. Testing token refresh..."
  curl -s -X POST "${BASE_URL}/api/v1/auth/refresh" \
    -H "Content-Type: application/json" \
    -d "{\"refresh_token\": \"${REFRESH_TOKEN}\"}" | jq .
  echo ""

  # Test 6: Duplicate registration (should fail)
  echo "6. Testing duplicate registration (should fail)..."
  curl -s -X POST "${BASE_URL}/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "password123",
      "first_name": "Test",
      "last_name": "User"
    }' | jq .
  echo ""

  # Test 7: Invalid login (should fail)
  echo "7. Testing invalid login (should fail)..."
  curl -s -X POST "${BASE_URL}/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "wrongpassword"
    }' | jq .
  echo ""

else
  echo "✗ Registration failed!"
  echo ""
fi

echo "=== Tests completed ==="
