#!/bin/bash

# Setup Jenkins Credentials for Azure Deployment
# This script helps you create and configure the necessary credentials

set -e

echo "🔧 Jenkins Credentials Setup for Azure Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}This script will help you set up Jenkins credentials for Azure deployment.${NC}"
echo -e "${YELLOW}Make sure you have Azure CLI installed and are logged in.${NC}"
echo ""

# Check if Azure CLI is available
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first:${NC}"
    echo "curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"
    exit 1
fi

# Check if user is logged in to Azure
if ! az account show &> /dev/null; then
    echo -e "${RED}❌ You are not logged in to Azure. Please run:${NC}"
    echo "az login"
    exit 1
fi

echo -e "${GREEN}✅ Azure CLI is available and you are logged in.${NC}"
echo ""

# Get current subscription info
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)

echo -e "${BLUE}Current Azure Subscription:${NC}"
echo "ID: $SUBSCRIPTION_ID"
echo "Name: $SUBSCRIPTION_NAME"
echo ""

# Confirm subscription
read -p "Is this the correct subscription? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please switch to the correct subscription and run this script again.${NC}"
    echo "az account set --subscription YOUR_SUBSCRIPTION_ID"
    exit 1
fi

echo -e "${BLUE}Creating Azure Service Principal...${NC}"

# Create Service Principal
SP_NAME="jenkins-deployment-$(date +%s)"
RESOURCE_GROUP="ergohub-production"
ACR_NAME="ergohubregistry"

echo "Creating Service Principal: $SP_NAME"

# Create the service principal
SP_OUTPUT=$(az ad sp create-for-rbac \
    --name "$SP_NAME" \
    --role Contributor \
    --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
    --output json)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to create Service Principal${NC}"
    exit 1
fi

# Extract values
CLIENT_ID=$(echo $SP_OUTPUT | jq -r '.appId')
CLIENT_SECRET=$(echo $SP_OUTPUT | jq -r '.password')
TENANT_ID=$(echo $SP_OUTPUT | jq -r '.tenant')

echo -e "${GREEN}✅ Service Principal created successfully!${NC}"
echo ""

# Add ACR permissions
echo -e "${BLUE}Adding ACR push permissions...${NC}"
az role assignment create \
    --assignee "$CLIENT_ID" \
    --role AcrPush \
    --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerRegistry/registries/$ACR_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ACR permissions added successfully!${NC}"
else
    echo -e "${YELLOW}⚠️ Warning: Could not add ACR permissions. You may need to add them manually.${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo -e "${BLUE}Now add these credentials to Jenkins:${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}1. Go to Jenkins → Manage Jenkins → Credentials${NC}"
echo -e "${YELLOW}2. Click 'Add Credentials' and create these 3 Secret Text credentials:${NC}"
echo ""
echo -e "${GREEN}Credential ID:${NC} azure-client-id"
echo -e "${GREEN}Secret:${NC} $CLIENT_ID"
echo -e "${GREEN}Description:${NC} Azure Service Principal Client ID"
echo ""
echo -e "${GREEN}Credential ID:${NC} azure-client-secret"
echo -e "${GREEN}Secret:${NC} $CLIENT_SECRET"
echo -e "${GREEN}Description:${NC} Azure Service Principal Client Secret"
echo ""
echo -e "${GREEN}Credential ID:${NC} azure-tenant-id"
echo -e "${GREEN}Secret:${NC} $TENANT_ID"
echo -e "${GREEN}Description:${NC} Azure Tenant ID"
echo ""
echo -e "${BLUE}3. Save the credentials and run your Jenkins pipeline!${NC}"
echo ""

# Save to file for reference
CREDS_FILE="azure-credentials-$(date +%Y%m%d-%H%M%S).txt"
cat > "$CREDS_FILE" << EOF
Azure Service Principal Credentials
Generated on: $(date)
Service Principal Name: $SP_NAME

Jenkins Credentials to create:

1. azure-client-id (Secret Text)
   Value: $CLIENT_ID

2. azure-client-secret (Secret Text)
   Value: $CLIENT_SECRET

3. azure-tenant-id (Secret Text)
   Value: $TENANT_ID

Resource Group: $RESOURCE_GROUP
Container Registry: $ACR_NAME
Subscription ID: $SUBSCRIPTION_ID
EOF

echo -e "${BLUE}💾 Credentials saved to:${NC} $CREDS_FILE"
echo -e "${YELLOW}⚠️ Keep this file secure and delete it after setting up Jenkins!${NC}"
echo ""
echo -e "${GREEN}🚀 You can now run your Jenkins pipelines with Azure deployment!${NC}" 