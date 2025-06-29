#!/bin/bash

# 🔄 Environment Switcher Script
# Helps switch between Azure (production) and Minikube (demo) environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

print_header() {
    echo "=================================================="
    print_color $BLUE "🔄 Freelance Platform - Environment Switcher"
    echo "=================================================="
}

show_help() {
    print_header
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  azure     - Switch to Azure production environment"
    echo "  minikube  - Switch to Minikube demo environment"
    echo "  status    - Show current environment status"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 azure      # Switch to Azure production"
    echo "  $0 minikube   # Switch to Minikube demo"
    echo "  $0 status     # Check current status"
}

check_azure_status() {
    print_color $BLUE "🌩️ Azure Environment Status:"
    
    # Check if Azure CLI is available
    if command -v az &> /dev/null; then
        print_color $GREEN "✅ Azure CLI: Available"
        
        # Check if logged in
        if az account show &> /dev/null; then
            SUBSCRIPTION=$(az account show --query name -o tsv)
            print_color $GREEN "✅ Azure Login: Authenticated ($SUBSCRIPTION)"
        else
            print_color $RED "❌ Azure Login: Not authenticated"
        fi
        
        # Check AKS cluster
        if az aks show --resource-group ergohub-production --name ergohub-k8s &> /dev/null; then
            print_color $GREEN "✅ AKS Cluster: ergohub-k8s (Running)"
        else
            print_color $RED "❌ AKS Cluster: Not accessible"
        fi
    else
        print_color $RED "❌ Azure CLI: Not installed"
    fi
    
    # Check kubectl context
    if kubectl config current-context 2>/dev/null | grep -q "ergohub-k8s"; then
        print_color $GREEN "✅ Kubectl Context: Azure AKS"
    else
        print_color $YELLOW "⚠️  Kubectl Context: Not set to Azure"
    fi
}

check_minikube_status() {
    print_color $BLUE "🔧 Minikube Environment Status:"
    
    # Check if minikube is available
    if command -v minikube &> /dev/null; then
        print_color $GREEN "✅ Minikube: Available"
        
        # Check if minikube is running
        if minikube status &> /dev/null; then
            print_color $GREEN "✅ Minikube Cluster: Running"
            
            # Get minikube IP
            MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "Unknown")
            print_color $GREEN "✅ Minikube IP: $MINIKUBE_IP"
        else
            print_color $RED "❌ Minikube Cluster: Not running"
        fi
    else
        print_color $RED "❌ Minikube: Not installed"
    fi
    
    # Check kubectl context
    if kubectl config current-context 2>/dev/null | grep -q "minikube"; then
        print_color $GREEN "✅ Kubectl Context: Minikube"
    else
        print_color $YELLOW "⚠️  Kubectl Context: Not set to Minikube"
    fi
}

switch_to_azure() {
    print_header
    print_color $BLUE "🌩️ Switching to Azure Production Environment..."
    
    # Check prerequisites
    if ! command -v az &> /dev/null; then
        print_color $RED "❌ Azure CLI not found. Please install Azure CLI first."
        exit 1
    fi
    
    # Login to Azure if needed
    if ! az account show &> /dev/null; then
        print_color $YELLOW "🔐 Azure login required..."
        az login
    fi
    
    # Get AKS credentials
    print_color $BLUE "🔑 Getting AKS credentials..."
    az aks get-credentials --resource-group ergohub-production --name ergohub-k8s --overwrite-existing
    
    # Verify connection
    if kubectl get nodes &> /dev/null; then
        print_color $GREEN "✅ Successfully connected to Azure AKS!"
        print_color $GREEN "🌐 Application URL: https://ergohub.duckdns.org"
    else
        print_color $RED "❌ Failed to connect to Azure AKS"
        exit 1
    fi
    
    echo ""
    print_color $BLUE "📋 Next Steps:"
    echo "1. Your kubectl is now configured for Azure AKS"
    echo "2. Use Jenkins pipelines: Freelance-Backend, Freelance-Frontend"
    echo "3. Push to Git for automatic deployment"
    echo "4. Monitor: Azure Portal → AKS → Insights"
}

switch_to_minikube() {
    print_header
    print_color $BLUE "🔧 Switching to Minikube Demo Environment..."
    
    # Check prerequisites
    if ! command -v minikube &> /dev/null; then
        print_color $RED "❌ Minikube not found. Please install Minikube first."
        exit 1
    fi
    
    # Start minikube if not running
    if ! minikube status &> /dev/null; then
        print_color $BLUE "🚀 Starting Minikube..."
        minikube start
    else
        print_color $GREEN "✅ Minikube is already running"
    fi
    
    # Set kubectl context
    print_color $BLUE "🔑 Setting kubectl context to Minikube..."
    kubectl config use-context minikube
    
    # Enable addons
    print_color $BLUE "🔧 Enabling Minikube addons..."
    minikube addons enable ingress
    minikube addons enable dashboard
    
    # Verify connection
    if kubectl get nodes &> /dev/null; then
        print_color $GREEN "✅ Successfully connected to Minikube!"
        MINIKUBE_IP=$(minikube ip)
        print_color $GREEN "🌐 Minikube IP: $MINIKUBE_IP"
    else
        print_color $RED "❌ Failed to connect to Minikube"
        exit 1
    fi
    
    echo ""
    print_color $BLUE "📋 Next Steps:"
    echo "1. Your kubectl is now configured for Minikube"
    echo "2. Use Jenkins pipelines: Freelance-Backend-Minikube, Freelance-Frontend-Minikube"
    echo "3. Access app: minikube service frontend -n freelance"
    echo "4. Monitor: minikube dashboard"
}

show_status() {
    print_header
    
    # Current kubectl context
    CURRENT_CONTEXT=$(kubectl config current-context 2>/dev/null || echo "None")
    print_color $BLUE "🎯 Current kubectl context: $CURRENT_CONTEXT"
    echo ""
    
    # Check both environments
    check_azure_status
    echo ""
    check_minikube_status
    
    echo ""
    print_color $BLUE "📋 Available Commands:"
    echo "  ./switch-environment.sh azure     - Switch to Azure"
    echo "  ./switch-environment.sh minikube  - Switch to Minikube"
}

# Main script logic
case "$1" in
    "azure")
        switch_to_azure
        ;;
    "minikube")
        switch_to_minikube
        ;;
    "status")
        show_status
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        print_color $RED "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 