#!/bin/bash

echo "🔄 Starting kubectl proxy for Jenkins integration..."

# Check if kubectl proxy is already running
if pgrep -f "kubectl proxy" > /dev/null; then
    echo "✅ kubectl proxy is already running"
    ps aux | grep "kubectl proxy" | grep -v grep
else
    echo "🚀 Starting kubectl proxy..."
    nohup kubectl proxy --port=8080 --address='0.0.0.0' --accept-hosts='^.*' > kubectl-proxy.log 2>&1 &
    
    # Wait a moment for it to start
    sleep 3
    
    # Verify it's running
    if pgrep -f "kubectl proxy" > /dev/null; then
        echo "✅ kubectl proxy started successfully"
        ps aux | grep "kubectl proxy" | grep -v grep
    else
        echo "❌ Failed to start kubectl proxy"
        exit 1
    fi
fi

# Test the connection
echo "🔍 Testing Kubernetes API connection..."
if curl -s http://localhost:8080/api/v1/namespaces > /dev/null; then
    echo "✅ Kubernetes API is accessible through proxy"
else
    echo "❌ Cannot connect to Kubernetes API through proxy"
    exit 1
fi

echo "🎉 kubectl proxy is ready for Jenkins!" 