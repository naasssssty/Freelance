#!/bin/bash

echo "🧹 Cleaning Jenkins workspace and fixing npm issues..."

# Remove problematic node_modules and package-lock.json
rm -rf frontend/node_modules
rm -f frontend/package-lock.json
rm -rf frontend/.npm

# Clear npm cache
npm cache clean --force

# Verify npm and node versions
echo "📋 Environment info:"
node --version
npm --version

# Clean install with specific flags to avoid file system issues
echo "📦 Installing dependencies with clean install..."
cd frontend
npm ci --no-optional --no-audit --no-fund --prefer-offline

echo "✅ Dependencies installation completed!" 