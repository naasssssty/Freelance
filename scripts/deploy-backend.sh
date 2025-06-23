#!/bin/bash

echo "🚀 Deploying Backend to Kubernetes..."

# Set variables
BACKEND_IMAGE=${1:-"freelance-backend:latest"}
FRONTEND_IMAGE=${2:-"freelance-frontend:latest"}

echo "📋 Using images:"
echo "  Backend: $BACKEND_IMAGE"
echo "  Frontend: $FRONTEND_IMAGE"

# Navigate to ansible directory
cd ansible

# Run the deployment playbook
echo "🎯 Running Ansible deployment..."
ansible-playbook deploy-kubernetes.yml \
    --extra-vars "backend_image=$BACKEND_IMAGE" \
    --extra-vars "frontend_image=$FRONTEND_IMAGE"

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo ""
    echo "🌐 Access the application at: http://freelance.local"
    echo "💡 Make sure to run 'minikube tunnel' in another terminal"
else
    echo "❌ Deployment failed!"
    exit 1
fi 