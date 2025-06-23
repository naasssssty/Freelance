#!/bin/bash

echo "🔍 Checking Kubernetes cluster status..."

# Function to check if minikube is installed
check_minikube() {
    if ! command -v minikube &> /dev/null; then
        echo "❌ minikube is not installed"
        return 1
    fi
    return 0
}

# Function to check if kubectl is installed
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        echo "❌ kubectl is not installed"
        return 1
    fi
    return 0
}

# Function to start minikube if not running
ensure_minikube_running() {
    echo "🔄 Checking minikube status..."
    
    if minikube status | grep -q "host: Running"; then
        echo "✅ minikube is already running"
        return 0
    else
        echo "🚀 Starting minikube..."
        minikube start --driver=docker --memory=4g --cpus=2
        
        if [ $? -eq 0 ]; then
            echo "✅ minikube started successfully"
            
            # Enable ingress addon
            echo "🔧 Enabling ingress addon..."
            minikube addons enable ingress
            
            return 0
        else
            echo "❌ Failed to start minikube"
            return 1
        fi
    fi
}

# Function to test cluster connectivity
test_cluster_connectivity() {
    echo "🧪 Testing cluster connectivity..."
    
    if kubectl cluster-info &> /dev/null; then
        echo "✅ Cluster is accessible"
        kubectl get nodes
        return 0
    else
        echo "❌ Cannot connect to cluster"
        return 1
    fi
}

# Function to copy kubeconfig for Jenkins
setup_kubeconfig_for_jenkins() {
    echo "📋 Setting up kubeconfig for Jenkins..."
    
    # Get the current kubeconfig
    KUBECONFIG_PATH="${HOME}/.kube/config"
    ANSIBLE_KUBECONFIG_PATH="ansible/.kubeconfig"
    
    if [ -f "$KUBECONFIG_PATH" ]; then
        cp "$KUBECONFIG_PATH" "$ANSIBLE_KUBECONFIG_PATH"
        echo "✅ Kubeconfig copied to $ANSIBLE_KUBECONFIG_PATH"
        
        # Make it readable
        chmod 644 "$ANSIBLE_KUBECONFIG_PATH"
        
        return 0
    else
        echo "❌ Kubeconfig not found at $KUBECONFIG_PATH"
        return 1
    fi
}

# Main execution
main() {
    echo "🎯 Ensuring Kubernetes cluster is ready for deployment..."
    
    # Check prerequisites
    if ! check_kubectl || ! check_minikube; then
        echo "❌ Prerequisites not met. Please install kubectl and minikube."
        exit 1
    fi
    
    # Ensure minikube is running
    if ! ensure_minikube_running; then
        echo "❌ Failed to start minikube"
        exit 1
    fi
    
    # Test connectivity
    if ! test_cluster_connectivity; then
        echo "❌ Cluster connectivity test failed"
        exit 1
    fi
    
    # Setup kubeconfig for Jenkins/Ansible
    if ! setup_kubeconfig_for_jenkins; then
        echo "❌ Failed to setup kubeconfig"
        exit 1
    fi
    
    echo ""
    echo "🎉 Kubernetes cluster is ready!"
    echo "📊 Cluster info:"
    kubectl cluster-info
    echo ""
    echo "🚀 You can now run the deployment pipeline."
}

# Run main function
main "$@" 