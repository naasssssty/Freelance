#!/bin/bash

# Deployment script for Freelance application to Kubernetes
# This script can be used for manual deployment or as reference

set -e

echo "🚀 Deploying Freelance application to Kubernetes..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Default values
BACKEND_IMAGE="${BACKEND_IMAGE:-papadooo/freelance-backend:latest}"
FRONTEND_IMAGE="${FRONTEND_IMAGE:-papadooo/freelance-frontend:latest}"
NAMESPACE="${NAMESPACE:-freelance}"

echo "📋 Deployment Configuration:"
echo "- Backend Image: $BACKEND_IMAGE"
echo "- Frontend Image: $FRONTEND_IMAGE"
echo "- Namespace: $NAMESPACE"
echo

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if we can connect to Kubernetes
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster"
    echo "Make sure minikube is running and kubectl is configured"
    exit 1
fi

print_status "Connected to Kubernetes cluster"

# Check if ansible-playbook is available
if ! command -v ansible-playbook &> /dev/null; then
    echo "❌ ansible-playbook is not installed or not in PATH"
    exit 1
fi

# Deploy using Ansible
echo "🔄 Running Ansible deployment..."
ansible-playbook ansible/deploy-kubernetes.yml \
    -i ansible/inventory.yml \
    --extra-vars "backend_image=$BACKEND_IMAGE" \
    --extra-vars "frontend_image=$FRONTEND_IMAGE" \
    -v

print_status "Deployment completed"

# Wait for pods to be ready
echo "⏳ Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=ready pod -l app=frontend -n $NAMESPACE --timeout=300s

print_status "All pods are ready"

# Show deployment status
echo
echo "📊 Deployment Status:"
kubectl get pods -n $NAMESPACE
echo
kubectl get services -n $NAMESPACE
echo
kubectl get ingress -n $NAMESPACE

echo
echo "🌐 Application should be available at: http://freelance.local"
print_warning "Make sure minikube tunnel is running for ingress to work"
echo "Run: sudo minikube tunnel" 