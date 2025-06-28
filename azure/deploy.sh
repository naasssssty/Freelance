#!/bin/bash

# Azure Deployment Script for Freelance Platform
# This script deploys the application to Azure Kubernetes Service using existing images

set -e  # Exit on any error

# Configuration - UPDATED WITH YOUR VALUES
RESOURCE_GROUP="ergohub-production"  # Your resource group
ACR_NAME="ergohubregistry"  # Your Azure Container Registry name
AKS_CLUSTER="ergohub-k8s"  # Your AKS cluster name
DOMAIN="ergohub.duckdns.org"  # Your DuckDNS domain

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Azure deployment for Freelance Platform${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
echo -e "${YELLOW}📋 Checking required tools...${NC}"
if ! command_exists az; then
    echo -e "${RED}❌ Azure CLI not found. Please install it first.${NC}"
    exit 1
fi

if ! command_exists kubectl; then
    echo -e "${RED}❌ kubectl not found. Please install it first.${NC}"
    exit 1
fi

# Login to Azure (if not already logged in)
echo -e "${YELLOW}🔐 Checking Azure login...${NC}"
if ! az account show >/dev/null 2>&1; then
    echo -e "${YELLOW}Please login to Azure:${NC}"
    az login
fi

# Connect to AKS cluster
echo -e "${YELLOW}🔗 Connecting to AKS cluster...${NC}"
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER --overwrite-existing

echo -e "${GREEN}✅ Using existing images from ACR${NC}"
echo -e "${YELLOW}📦 Images:${NC}"
echo -e "   - ergohubregistry.azurecr.io/freelance-backend:latest"
echo -e "   - ergohubregistry.azurecr.io/freelance-frontend:latest"

# Install nginx-ingress controller if not exists
echo -e "${YELLOW}🌐 Checking nginx-ingress controller...${NC}"
if ! kubectl get namespace ingress-nginx >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing nginx-ingress controller...${NC}"
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
    
    # Wait for ingress controller to be ready
    echo -e "${YELLOW}⏳ Waiting for ingress controller to be ready...${NC}"
    kubectl wait --namespace ingress-nginx \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/component=controller \
        --timeout=300s
fi

# Install cert-manager if not exists (for SSL certificates)
echo -e "${YELLOW}🔒 Checking cert-manager...${NC}"
if ! kubectl get namespace cert-manager >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing cert-manager...${NC}"
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml
    
    # Wait for cert-manager to be ready
    echo -e "${YELLOW}⏳ Waiting for cert-manager to be ready...${NC}"
    kubectl wait --namespace cert-manager \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/name=cert-manager \
        --timeout=300s
fi

# Create ClusterIssuer for Let's Encrypt
echo -e "${YELLOW}📜 Creating Let's Encrypt ClusterIssuer...${NC}"
cat <<EOL | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: ananaaa8888@gmail.com  # Your email for Let's Encrypt
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOL

# Deploy the application
echo -e "${YELLOW}🚀 Deploying application to Kubernetes...${NC}"
kubectl apply -f ../kubernetes/namespace.yml
kubectl apply -f ../kubernetes/configmap.yml
kubectl apply -f ../kubernetes/postgres-deployment.yml
kubectl apply -f ../kubernetes/minio-deployment.yml
kubectl apply -f ../kubernetes/mailhog-deployment.yml
kubectl apply -f ../kubernetes/backend-deployment-azure.yml
kubectl apply -f ../kubernetes/frontend-deployment.yml
kubectl apply -f ../kubernetes/ingress.yml

# Wait for deployments to be ready
echo -e "${YELLOW}⏳ Waiting for deployments to be ready...${NC}"
kubectl wait --for=condition=available --timeout=600s deployment/backend -n freelance
kubectl wait --for=condition=available --timeout=600s deployment/frontend -n freelance
kubectl wait --for=condition=available --timeout=600s deployment/postgres -n freelance

# Get the external IP of the ingress controller
echo -e "${YELLOW}🌍 Getting external IP address...${NC}"
EXTERNAL_IP=""
while [ -z $EXTERNAL_IP ]; do
    echo "Waiting for external IP..."
    EXTERNAL_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx --template="{{range .status.loadBalancer.ingress}}{{.ip}}{{end}}")
    [ -z "$EXTERNAL_IP" ] && sleep 10
done

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "   🌐 External IP: ${GREEN}$EXTERNAL_IP${NC}"
echo -e "   🔗 Domain: ${GREEN}$DOMAIN${NC}"
echo -e "   📱 Frontend: ${GREEN}https://$DOMAIN${NC}"
echo -e "   🔧 API: ${GREEN}https://$DOMAIN/api${NC}"
echo -e "   📧 MailHog: ${GREEN}https://mailhog-$DOMAIN${NC}"
echo -e "   💾 MinIO: ${GREEN}https://minio-$DOMAIN${NC}"

echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo -e "   1. Update your DuckDNS domains with IP: $EXTERNAL_IP"
echo -e "   2. Run this command:"
echo -e "      ${GREEN}curl \"https://www.duckdns.org/update?domains=ergohub,api-ergohub,minio-ergohub,mailhog-ergohub&token=1daa6484-bcab-40c5-9768-db1e6ac16a8f&ip=$EXTERNAL_IP\"${NC}"
echo -e "   3. Wait for DNS propagation (2-5 minutes)"
echo -e "   4. SSL certificates will be automatically generated by Let's Encrypt"

echo -e "${GREEN}🎉 Your Freelance Platform is now deployed to Azure!${NC}"
