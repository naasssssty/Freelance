#!/bin/bash

# Quick fix script for Jenkins cleanup issues
# This script demonstrates the proper way to handle Docker cleanup in Jenkins

echo "🔧 Jenkins Cleanup Fix Script"
echo "============================="

# Set variables (these would normally come from Jenkins environment)
DOCKER_IMAGE="${DOCKER_IMAGE:-ergohubregistry.azurecr.io/freelance-frontend:47}"
ACR_NAME="${ACR_NAME:-ergohubregistry}"

echo "🐳 Demonstrating robust Docker cleanup..."

# The WRONG way (causes exit code 1)
echo ""
echo "❌ WRONG way (causes pipeline failures):"
echo "docker rmi \$DOCKER_IMAGE || true"
echo "Problem: Even with '|| true', some Docker errors can still cause exit code 1"

echo ""
echo "✅ CORRECT way (prevents pipeline failures):"

# The RIGHT way - robust cleanup
set +e  # Don't exit on error

echo "🧹 Starting cleanup process..."

# Clean up Docker images with better error handling
if docker images | grep -q "$DOCKER_IMAGE" 2>/dev/null; then
    echo "Removing Docker image: $DOCKER_IMAGE"
    docker rmi "$DOCKER_IMAGE" 2>/dev/null || echo "Failed to remove $DOCKER_IMAGE (this is OK)"
else
    echo "Docker image $DOCKER_IMAGE not found locally, skipping removal"
fi

if docker images | grep -q "${ACR_NAME}.azurecr.io/freelance-frontend:latest" 2>/dev/null; then
    echo "Removing Docker image: ${ACR_NAME}.azurecr.io/freelance-frontend:latest"
    docker rmi "${ACR_NAME}.azurecr.io/freelance-frontend:latest" 2>/dev/null || echo "Failed to remove latest image (this is OK)"
else
    echo "Latest frontend image not found locally, skipping removal"
fi

# Clean up sensitive files
echo "Removing sensitive files..."
rm -f acr_token.txt 2>/dev/null || true
rm -f kubeconfig 2>/dev/null || true

# Clean up any temporary Ansible files
echo "Removing Ansible temporary files..."
rm -f *.retry 2>/dev/null || true
rm -rf .ansible 2>/dev/null || true

# Clean up frontend build artifacts if needed
echo "Removing frontend cache..."
rm -rf frontend/node_modules/.cache 2>/dev/null || true

echo "✅ Cleanup completed successfully"

set -e  # Re-enable exit on error

echo ""
echo "📋 Key improvements:"
echo "1. Use 'set +e' before cleanup operations"
echo "2. Check if images exist before trying to remove them"
echo "3. Redirect stderr to /dev/null to suppress error messages"
echo "4. Use explicit error messages instead of relying on '|| true'"
echo "5. Re-enable 'set -e' after cleanup"
echo "6. Wrap everything in a try-catch block in Jenkins"

echo ""
echo "🎯 Result: No more exit code 1 failures in Jenkins cleanup!" 