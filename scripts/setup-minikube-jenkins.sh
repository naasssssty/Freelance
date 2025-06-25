#!/bin/bash

# Setup script for Minikube and Jenkins integration for Freelance DevOps project
# This script ensures proper setup for Kubernetes deployment via Jenkins

set -e

echo "🚀 Setting up Minikube and Jenkins for Freelance DevOps project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if minikube is installed
if ! command -v minikube &> /dev/null; then
    print_error "Minikube is not installed. Please install minikube first."
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl first."
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker first."
fi

# Start minikube if not running
if ! minikube status | grep -q "host: Running"; then
    echo "🔄 Starting Minikube..."
    minikube start --driver=docker --memory=4096 --cpus=2
    print_status "Minikube started"
else
    print_status "Minikube is already running"
fi

# Enable ingress addon
echo "🔄 Enabling ingress addon..."
minikube addons enable ingress
print_status "Ingress addon enabled"

# Create kubeconfig for Jenkins
echo "🔄 Creating Jenkins-compatible kubeconfig..."
KUBE_CONFIG_DIR="./ansible"
mkdir -p $KUBE_CONFIG_DIR

# Get minikube API server IP that's accessible from Docker containers
MINIKUBE_IP=$(minikube ip)
MINIKUBE_PORT=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}' | cut -d: -f3)

# Create a kubeconfig specifically for Jenkins container access
cat > ${KUBE_CONFIG_DIR}/.kubeconfig << EOF
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: $(kubectl config view --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')
    server: https://host.docker.internal:${MINIKUBE_PORT}
  name: minikube
contexts:
- context:
    cluster: minikube
    user: minikube
  name: minikube
current-context: minikube
kind: Config
preferences: {}
users:
- name: minikube
  user:
    client-certificate-data: $(kubectl config view --raw -o jsonpath='{.users[0].user.client-certificate-data}')
    client-key-data: $(kubectl config view --raw -o jsonpath='{.users[0].user.client-key-data}')
EOF

print_status "Jenkins kubeconfig created at ${KUBE_CONFIG_DIR}/.kubeconfig"

# Test kubectl connectivity
echo "🔄 Testing kubectl connectivity..."
if kubectl cluster-info &> /dev/null; then
    print_status "kubectl connectivity confirmed"
else
    print_error "kubectl connectivity failed"
fi

# Create namespace
echo "🔄 Creating freelance namespace..."
kubectl create namespace freelance --dry-run=client -o yaml | kubectl apply -f -
print_status "Namespace 'freelance' created"

# Build Docker images for local registry
echo "🔄 Building Docker images..."
docker build -t papadooo/freelance-backend:latest -f docker/Dockerfile.backend .
docker build -t papadooo/freelance-frontend:latest -f docker/Dockerfile.frontend frontend/
print_status "Docker images built"

# Start Jenkins container if not running
echo "🔄 Checking Jenkins container..."
if ! docker ps | grep -q freelance-jenkins; then
    echo "Starting Jenkins container..."
    docker-compose -f docker/docker-compose-jenkins.yml up -d
    print_status "Jenkins container started"
    
    # Wait for Jenkins to be ready
    echo "⏳ Waiting for Jenkins to be ready..."
    timeout=300
    while ! curl -s http://localhost:8081 > /dev/null && [ $timeout -gt 0 ]; do
        sleep 5
        timeout=$((timeout-5))
        echo -n "."
    done
    echo
    
    if [ $timeout -le 0 ]; then
        print_error "Jenkins failed to start within 5 minutes"
    fi
    
    print_status "Jenkins is ready at http://localhost:8081"
else
    print_status "Jenkins container is already running"
fi

# Add freelance.local to /etc/hosts if not present
if ! grep -q "freelance.local" /etc/hosts; then
    echo "🔄 Adding freelance.local to /etc/hosts..."
    echo "$(minikube ip) freelance.local" | sudo tee -a /etc/hosts
    print_status "freelance.local added to /etc/hosts"
fi

# Start minikube tunnel in background (needed for ingress)
echo "🔄 Starting minikube tunnel..."
sudo minikube tunnel &> /dev/null &
TUNNEL_PID=$!
echo $TUNNEL_PID > /tmp/minikube-tunnel.pid
print_status "Minikube tunnel started (PID: $TUNNEL_PID)"

echo
echo "🎉 Setup completed successfully!"
echo
echo "📋 Next steps:"
echo "1. Access Jenkins at: http://localhost:8081"
echo "2. Configure Jenkins with the following credentials:"
echo "   - Add Docker Hub credentials (ID: docker-hub-credentials)"
echo "   - Add kubeconfig file (ID: kubeconfig-secret) from: ${KUBE_CONFIG_DIR}/.kubeconfig"
echo "3. Install required Jenkins plugins:"
echo "   - Docker Pipeline"
echo "   - Kubernetes CLI"
echo "   - Ansible"
echo "4. Configure tools in Jenkins:"
echo "   - Maven 3"
echo "   - JDK 21 Linux"
echo "   - Node 21"
echo "5. Create pipelines for:"
echo "   - Freelance-Backend (using jenkins/Jenkinsfile-backend)"
echo "   - Freelance-Frontend (using jenkins/Jenkinsfile-frontend)"
echo
echo "🌐 After deployment, access the application at: http://freelance.local"
echo
print_warning "Keep the minikube tunnel running for ingress to work properly"
echo "To stop the tunnel later: sudo kill \$(cat /tmp/minikube-tunnel.pid)" 