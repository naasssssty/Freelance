#!/bin/bash

# Test script for Ansible Azure Kubernetes deployment
# This script validates the Ansible setup and tests the deployment playbook

set -e

echo "🧪 Testing Ansible Azure Kubernetes Deployment Setup"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Test 1: Check if Ansible is installed
echo ""
print_info "Testing Ansible installation..."
if command -v ansible &> /dev/null; then
    ANSIBLE_VERSION=$(ansible --version | head -1)
    print_status 0 "Ansible is installed: $ANSIBLE_VERSION"
else
    print_status 1 "Ansible is not installed"
fi

# Test 2: Check required Ansible collections
echo ""
print_info "Testing Ansible collections..."
if ansible-galaxy collection list | grep -q "kubernetes.core"; then
    print_status 0 "kubernetes.core collection is installed"
else
    print_status 1 "kubernetes.core collection is not installed"
fi

if ansible-galaxy collection list | grep -q "ansible.posix"; then
    print_status 0 "ansible.posix collection is installed"
else
    print_status 1 "ansible.posix collection is not installed"
fi

# Test 3: Check Python dependencies
echo ""
print_info "Testing Python dependencies..."
if python3 -c "import kubernetes" &> /dev/null; then
    print_status 0 "Python kubernetes library is installed"
else
    print_status 1 "Python kubernetes library is not installed"
fi

if python3 -c "import yaml" &> /dev/null; then
    print_status 0 "Python yaml library is installed"
else
    print_status 1 "Python yaml library is not installed"
fi

# Test 4: Check if kubeconfig exists
echo ""
print_info "Testing Kubernetes configuration..."
if [ -f "./kubeconfig" ]; then
    print_status 0 "kubeconfig file exists"
    export KUBECONFIG=./kubeconfig
    if kubectl get nodes &> /dev/null; then
        print_status 0 "Kubernetes cluster is accessible"
    else
        print_warning "kubeconfig exists but cluster is not accessible"
    fi
elif [ -f "$HOME/.kube/config" ]; then
    print_status 0 "Default kubeconfig exists"
    if kubectl get nodes &> /dev/null; then
        print_status 0 "Kubernetes cluster is accessible"
    else
        print_warning "kubeconfig exists but cluster is not accessible"
    fi
else
    print_warning "No kubeconfig found - cluster access will be tested during deployment"
fi

# Test 5: Check Azure CLI (if available)
echo ""
print_info "Testing Azure CLI..."
if command -v az &> /dev/null; then
    AZ_VERSION=$(az version --output tsv --query '"azure-cli"')
    print_status 0 "Azure CLI is installed: $AZ_VERSION"
    
    # Test Azure login status
    if az account show &> /dev/null; then
        ACCOUNT_NAME=$(az account show --query name -o tsv)
        print_status 0 "Azure CLI is logged in: $ACCOUNT_NAME"
    else
        print_warning "Azure CLI is not logged in"
    fi
else
    print_warning "Azure CLI is not installed - will be handled by Jenkins container"
fi

# Test 6: Validate Ansible playbook syntax
echo ""
print_info "Testing Ansible playbook syntax..."
if [ -f "ansible/deploy-azure-k8s.yml" ]; then
    if ansible-playbook ansible/deploy-azure-k8s.yml --syntax-check &> /dev/null; then
        print_status 0 "Azure deployment playbook syntax is valid"
    else
        print_status 1 "Azure deployment playbook has syntax errors"
    fi
else
    print_status 1 "Azure deployment playbook not found"
fi

if [ -f "ansible/inventory.yml" ]; then
    if ansible-inventory -i ansible/inventory.yml --list &> /dev/null; then
        print_status 0 "Ansible inventory is valid"
    else
        print_status 1 "Ansible inventory has errors"
    fi
else
    print_status 1 "Ansible inventory not found"
fi

# Test 7: Test Ansible playbook (dry run)
echo ""
print_info "Testing Ansible playbook (dry run)..."
if [ -f "ansible/deploy-azure-k8s.yml" ] && [ -f "ansible/inventory.yml" ]; then
    print_info "Running Ansible playbook dry run..."
    if ansible-playbook -i ansible/inventory.yml ansible/deploy-azure-k8s.yml \
        -e "backend_docker_image=ergohubregistry.azurecr.io/freelance-backend:test" \
        -e "frontend_docker_image=ergohubregistry.azurecr.io/freelance-frontend:test" \
        -e "kubeconfig_path=./kubeconfig" \
        --check --diff &> /tmp/ansible_test.log; then
        print_status 0 "Ansible playbook dry run completed successfully"
    else
        print_warning "Ansible playbook dry run failed - check /tmp/ansible_test.log"
        echo "Last 10 lines of error log:"
        tail -10 /tmp/ansible_test.log
    fi
else
    print_warning "Skipping dry run - playbook or inventory not found"
fi

# Test 8: Check Docker (if available)
echo ""
print_info "Testing Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_status 0 "Docker is installed: $DOCKER_VERSION"
    
    if docker ps &> /dev/null; then
        print_status 0 "Docker daemon is running"
    else
        print_warning "Docker daemon is not running or not accessible"
    fi
else
    print_warning "Docker is not installed - required for Jenkins pipeline"
fi

# Test 9: Check environment variables
echo ""
print_info "Testing environment variables..."
if [ -n "$ANSIBLE_HOST_KEY_CHECKING" ]; then
    print_status 0 "ANSIBLE_HOST_KEY_CHECKING is set: $ANSIBLE_HOST_KEY_CHECKING"
else
    print_warning "ANSIBLE_HOST_KEY_CHECKING not set - will be set in pipeline"
fi

if [ -n "$KUBECONFIG" ]; then
    print_status 0 "KUBECONFIG is set: $KUBECONFIG"
else
    print_warning "KUBECONFIG not set - will be set in pipeline"
fi

# Summary
echo ""
echo "🎯 Test Summary"
echo "==============="
print_info "Prerequisites check completed"
print_info "Review any warnings above before running the Jenkins pipeline"

echo ""
echo "🚀 Next Steps"
echo "============="
echo "1. If all tests passed, you can run the Jenkins pipeline"
echo "2. If there are warnings, address them or ensure they're handled in the pipeline"
echo "3. For manual testing, use:"
echo "   ansible-playbook -i ansible/inventory.yml ansible/deploy-azure-k8s.yml \\"
echo "     -e \"backend_docker_image=YOUR_BACKEND_IMAGE\" \\"
echo "     -e \"frontend_docker_image=YOUR_FRONTEND_IMAGE\" \\"
echo "     -e \"kubeconfig_path=./kubeconfig\" \\"
echo "     -v"

echo ""
echo "🔧 Troubleshooting"
echo "=================="
echo "- Install missing dependencies: ./docker/setup-ansible-jenkins.sh"
echo "- Check Azure credentials: az login"
echo "- Verify kubeconfig: kubectl get nodes"
echo "- Test playbook syntax: ansible-playbook ansible/deploy-azure-k8s.yml --syntax-check"

echo ""
print_info "Test completed! 🎉" 