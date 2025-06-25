#!/bin/bash

# Ensure Minikube Tunnel is Running for Jenkins Connectivity
# This script ensures stable networking for Jenkins to access Kubernetes

set -e

echo "🔧 Ensuring Minikube Tunnel is Running..."

# Check if minikube is running
if ! minikube status >/dev/null 2>&1; then
    echo "❌ Minikube is not running. Starting minikube..."
    minikube start --driver=docker
    echo "✅ Minikube started successfully"
fi

# Check if tunnel is already running
TUNNEL_PID=$(pgrep -f "minikube tunnel" || echo "")

if [ -n "$TUNNEL_PID" ]; then
    echo "✅ Minikube tunnel is already running (PID: $TUNNEL_PID)"
else
    echo "🚇 Starting minikube tunnel..."
    # Start tunnel in background, but don't detach completely
    nohup minikube tunnel --cleanup > /tmp/minikube-tunnel.log 2>&1 &
    TUNNEL_PID=$!
    echo "✅ Minikube tunnel started (PID: $TUNNEL_PID)"
    
    # Wait a moment for tunnel to establish
    sleep 3
fi

# Verify Kubernetes API is accessible
echo "🔍 Verifying Kubernetes API accessibility..."
API_URL=$(kubectl cluster-info | grep "control plane" | awk '{print $NF}')
echo "API Server: $API_URL"

if kubectl cluster-info >/dev/null 2>&1; then
    echo "✅ Kubernetes API is accessible"
else
    echo "❌ Cannot access Kubernetes API"
    exit 1
fi

# Verify /etc/hosts entry for freelance.local
if ! grep -q "freelance.local" /etc/hosts; then
    echo "⚠️  Adding freelance.local to /etc/hosts..."
    echo "127.0.0.1 freelance.local" | sudo tee -a /etc/hosts
    echo "✅ Added freelance.local to /etc/hosts"
else
    echo "✅ freelance.local entry exists in /etc/hosts"
fi

echo "🎉 Network setup complete!"
echo ""
echo "📋 Summary:"
echo "- Minikube Status: $(minikube status --format='{{.Host}}' 2>/dev/null || echo 'Unknown')"
echo "- Tunnel PID: $TUNNEL_PID"
echo "- API Server: $API_URL"
echo "- Application URL: http://freelance.local"
echo ""
echo "🚀 Ready for Jenkins deployment!" 