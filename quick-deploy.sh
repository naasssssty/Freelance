#!/bin/bash

# Quick Deploy Script for Freelance Platform to Azure AKS
# This script builds, pushes, and deploys your changes to Azure

set -e  # Exit on any error

# Configuration
ACR_NAME="ergohubregistry"
RESOURCE_GROUP="ergohub-production"
AKS_CLUSTER="ergohub-k8s"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Quick Deploy to Azure AKS${NC}"
echo -e "${YELLOW}================================${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
echo -e "${YELLOW}📋 Checking required tools...${NC}"
for tool in az docker kubectl; do
    if ! command_exists $tool; then
        echo -e "${RED}❌ $tool not found. Please install it first.${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ All required tools found${NC}"

# Check if user is logged in to Azure
echo -e "${YELLOW}🔐 Checking Azure login...${NC}"
if ! az account show >/dev/null 2>&1; then
    echo -e "${YELLOW}Please login to Azure:${NC}"
    az login
fi

# Login to ACR
echo -e "${YELLOW}🔑 Logging into Azure Container Registry...${NC}"
az acr login --name $ACR_NAME

# Ask user what to deploy
echo -e "${YELLOW}📦 What do you want to deploy?${NC}"
echo "1) Backend only"
echo "2) Frontend only" 
echo "3) Both backend and frontend"
read -p "Enter your choice (1-3): " choice

BUILD_BACKEND=false
BUILD_FRONTEND=false

case $choice in
    1)
        BUILD_BACKEND=true
        echo -e "${GREEN}Will deploy backend only${NC}"
        ;;
    2)
        BUILD_FRONTEND=true
        echo -e "${GREEN}Will deploy frontend only${NC}"
        ;;
    3)
        BUILD_BACKEND=true
        BUILD_FRONTEND=true
        echo -e "${GREEN}Will deploy both backend and frontend${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

# Build and push backend
if [ "$BUILD_BACKEND" = true ]; then
    echo -e "${YELLOW}🔧 Building backend Docker image...${NC}"
    docker build -t $ACR_NAME.azurecr.io/freelance-backend:latest -f docker/Dockerfile.backend .
    
    echo -e "${YELLOW}📤 Pushing backend image to ACR...${NC}"
    docker push $ACR_NAME.azurecr.io/freelance-backend:latest
    echo -e "${GREEN}✅ Backend image pushed successfully${NC}"
fi

# Build and push frontend
if [ "$BUILD_FRONTEND" = true ]; then
    echo -e "${YELLOW}🌐 Building frontend Docker image...${NC}"
    docker build -t $ACR_NAME.azurecr.io/freelance-frontend:latest -f docker/Dockerfile.frontend .
    
    echo -e "${YELLOW}📤 Pushing frontend image to ACR...${NC}"
    docker push $ACR_NAME.azurecr.io/freelance-frontend:latest
    echo -e "${GREEN}✅ Frontend image pushed successfully${NC}"
fi

# Connect to AKS
echo -e "${YELLOW}🔗 Connecting to AKS cluster...${NC}"
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER --overwrite-existing

# Deploy to Kubernetes
echo -e "${YELLOW}🚀 Deploying to Kubernetes...${NC}"

if [ "$BUILD_BACKEND" = true ]; then
    echo -e "${YELLOW}Updating backend deployment...${NC}"
    kubectl rollout restart deployment/backend -n freelance
    kubectl rollout status deployment/backend -n freelance --timeout=300s
    echo -e "${GREEN}✅ Backend deployed successfully${NC}"
fi

if [ "$BUILD_FRONTEND" = true ]; then
    echo -e "${YELLOW}Updating frontend deployment...${NC}"
    kubectl rollout restart deployment/frontend -n freelance
    kubectl rollout status deployment/frontend -n freelance --timeout=300s
    echo -e "${GREEN}✅ Frontend deployed successfully${NC}"
fi

# Show deployment status
echo -e "${YELLOW}📊 Current deployment status:${NC}"
kubectl get pods -n freelance

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📱 Your application is available at: https://ergohub.duckdns.org${NC}" 