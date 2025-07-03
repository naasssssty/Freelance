#!/bin/bash

# Debug script for Jenkins pipeline issues
# This script helps troubleshoot common Jenkins pipeline problems

set -e

echo "🔍 Jenkins Pipeline Debug Tool"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_section() {
    echo -e "\n${BLUE}==== $1 ====${NC}"
}

# Check if running in Jenkins environment
print_section "Environment Check"
if [ -n "$JENKINS_URL" ]; then
    print_status 0 "Running in Jenkins environment"
    print_info "Jenkins URL: $JENKINS_URL"
    print_info "Build Number: ${BUILD_NUMBER:-'Not set'}"
    print_info "Job Name: ${JOB_NAME:-'Not set'}"
else
    print_warning "Not running in Jenkins environment"
fi

# Check Docker status
print_section "Docker Status"
if command -v docker &> /dev/null; then
    print_status 0 "Docker is installed"
    
    if docker ps &> /dev/null; then
        print_status 0 "Docker daemon is running"
        
        # Show Docker info
        print_info "Docker version: $(docker --version)"
        print_info "Docker images count: $(docker images | wc -l)"
        print_info "Running containers: $(docker ps | wc -l)"
        
        # Check for freelance images
        print_info "Checking for freelance images..."
        if docker images | grep -q freelance; then
            echo "Found freelance images:"
            docker images | grep freelance
        else
            print_info "No freelance images found"
        fi
        
        # Check for ACR images
        print_info "Checking for Azure Container Registry images..."
        if docker images | grep -q "azurecr.io"; then
            echo "Found ACR images:"
            docker images | grep "azurecr.io"
        else
            print_info "No ACR images found"
        fi
        
    else
        print_status 1 "Docker daemon is not running"
    fi
else
    print_status 1 "Docker is not installed"
fi

# Check Azure CLI
print_section "Azure CLI Status"
if command -v az &> /dev/null; then
    print_status 0 "Azure CLI is installed"
    print_info "Azure CLI version: $(az version --output tsv --query '"azure-cli"')"
    
    if az account show &> /dev/null; then
        print_status 0 "Azure CLI is logged in"
        print_info "Current subscription: $(az account show --query name -o tsv)"
    else
        print_warning "Azure CLI is not logged in"
    fi
else
    print_warning "Azure CLI is not installed"
fi

# Check Kubernetes connectivity
print_section "Kubernetes Status"
if command -v kubectl &> /dev/null; then
    print_status 0 "kubectl is installed"
    print_info "kubectl version: $(kubectl version --client --short 2>/dev/null || echo 'Unable to get version')"
    
    # Check kubeconfig
    if [ -f "./kubeconfig" ]; then
        print_status 0 "Local kubeconfig found"
        export KUBECONFIG=./kubeconfig
    elif [ -f "$HOME/.kube/config" ]; then
        print_status 0 "Default kubeconfig found"
    else
        print_warning "No kubeconfig found"
    fi
    
    # Test cluster connectivity
    if kubectl cluster-info &> /dev/null; then
        print_status 0 "Kubernetes cluster is accessible"
        print_info "Cluster info: $(kubectl cluster-info | head -1)"
        
        # Check freelance namespace
        if kubectl get namespace freelance &> /dev/null; then
            print_status 0 "Freelance namespace exists"
            print_info "Pods in freelance namespace: $(kubectl get pods -n freelance --no-headers | wc -l)"
        else
            print_warning "Freelance namespace does not exist"
        fi
    else
        print_status 1 "Cannot connect to Kubernetes cluster"
    fi
else
    print_warning "kubectl is not installed"
fi

# Check Ansible
print_section "Ansible Status"
if command -v ansible &> /dev/null; then
    print_status 0 "Ansible is installed"
    print_info "Ansible version: $(ansible --version | head -1)"
    
    # Check Ansible collections
    if ansible-galaxy collection list | grep -q "kubernetes.core"; then
        print_status 0 "kubernetes.core collection is installed"
    else
        print_warning "kubernetes.core collection is not installed"
    fi
    
    # Check playbook syntax
    if [ -f "ansible/deploy-azure-k8s.yml" ]; then
        if ansible-playbook ansible/deploy-azure-k8s.yml --syntax-check &> /dev/null; then
            print_status 0 "Azure deployment playbook syntax is valid"
        else
            print_status 1 "Azure deployment playbook has syntax errors"
        fi
    else
        print_warning "Azure deployment playbook not found"
    fi
else
    print_warning "Ansible is not installed"
fi

# Check file permissions and workspace
print_section "Workspace Status"
print_info "Current directory: $(pwd)"
print_info "User: $(whoami)"
print_info "User ID: $(id)"

# Check for sensitive files
print_info "Checking for sensitive files..."
if [ -f "acr_token.txt" ]; then
    print_warning "ACR token file found (should be cleaned up)"
else
    print_status 0 "No ACR token file found"
fi

if [ -f "kubeconfig" ]; then
    print_warning "Kubeconfig file found (should be cleaned up after use)"
else
    print_status 0 "No kubeconfig file found"
fi

# Check disk space
print_section "System Resources"
print_info "Disk usage:"
df -h . | tail -1

print_info "Memory usage:"
free -h | head -2

# Check Jenkins-specific issues
print_section "Jenkins-Specific Checks"
if [ -n "$WORKSPACE" ]; then
    print_info "Jenkins workspace: $WORKSPACE"
    
    # Check workspace permissions
    if [ -w "$WORKSPACE" ]; then
        print_status 0 "Workspace is writable"
    else
        print_status 1 "Workspace is not writable"
    fi
else
    print_warning "WORKSPACE variable not set"
fi

# Check for common pipeline artifacts
print_info "Checking for build artifacts..."
if [ -d "target" ]; then
    print_info "Maven target directory found"
fi

if [ -d "frontend/build" ]; then
    print_info "Frontend build directory found"
fi

if [ -d "frontend/node_modules" ]; then
    print_info "Node modules directory found"
fi

# Summary and recommendations
print_section "Summary and Recommendations"
echo "Debug information collected. Common issues and solutions:"
echo ""
echo "1. 🐳 Docker cleanup failures:"
echo "   - Use 'set +e' before Docker commands in cleanup"
echo "   - Check if images exist before trying to remove them"
echo "   - Wrap cleanup in try-catch blocks"
echo ""
echo "2. 🔐 Azure authentication issues:"
echo "   - Verify Azure service principal credentials"
echo "   - Check ACR login token generation"
echo "   - Ensure proper credential scopes"
echo ""
echo "3. ☸️ Kubernetes connectivity:"
echo "   - Verify kubeconfig file exists and is valid"
echo "   - Check network connectivity to cluster"
echo "   - Ensure proper RBAC permissions"
echo ""
echo "4. 🎭 Ansible deployment issues:"
echo "   - Verify Ansible collections are installed"
echo "   - Check playbook syntax"
echo "   - Ensure proper inventory configuration"
echo ""
echo "5. 🧹 General cleanup best practices:"
echo "   - Always use error handling in cleanup stages"
echo "   - Remove sensitive files (tokens, kubeconfigs)"
echo "   - Clean up Docker images to save space"
echo ""

print_info "Debug completed! Check the output above for any issues." 