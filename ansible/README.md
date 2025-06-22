# Freelance Application - Ansible Deployment

This directory contains Ansible playbooks for deploying the Freelance application to different environments as required by the DevOps course.

## Prerequisites

### Install Ansible
```bash
# macOS
brew install ansible

# Ubuntu/Debian
sudo apt update
sudo apt install ansible

# Install Kubernetes collection
ansible-galaxy collection install kubernetes.core
```

### Install Required Tools
- **kubectl** (for Kubernetes deployment)
- **Docker** (for Docker deployment)
- **minikube** (for local Kubernetes)

## Available Playbooks

### 1. Kubernetes Deployment (`deploy-kubernetes.yml`)
Deploys the application to a Kubernetes cluster using the YAML manifests.

```bash
# Deploy to Kubernetes
ansible-playbook -i inventory.yml deploy-kubernetes.yml

# Deploy with specific images
ansible-playbook -i inventory.yml deploy-kubernetes.yml \
    --extra-vars "backend_image=papadooo/freelance-backend:123" \
    --extra-vars "frontend_image=papadooo/freelance-frontend:456"
```

### 2. Docker Deployment (`deploy-docker.yml`)
Deploys the application using Docker Compose.

```bash
# Deploy with Docker Compose
ansible-playbook -i inventory.yml deploy-docker.yml
```

### 3. VM Setup (`setup-vm.yml`)
Sets up a VM with all required dependencies and deploys the application directly.

```bash
# Setup VM and deploy
ansible-playbook -i inventory.yml setup-vm.yml
```

### 4. Universal Deployment (`deploy-all.yml`)
Master playbook that can deploy to any environment.

```bash
# Deploy to Kubernetes (default)
ansible-playbook deploy-all.yml

# Deploy to Docker
ansible-playbook deploy-all.yml --extra-vars "deploy_env=docker"

# Deploy to VM
ansible-playbook deploy-all.yml --extra-vars "deploy_env=vm"
```

## Configuration

### Inventory (`inventory.yml`)
Contains the host definitions and variables for different environments.

### Variables
Key variables that can be overridden:
- `backend_image`: Backend Docker image (default: papadooo/freelance-backend:latest)
- `frontend_image`: Frontend Docker image (default: papadooo/freelance-frontend:latest)
- `app_namespace`: Kubernetes namespace (default: freelance)
- `postgres_password`: Database password
- `minio_access_key`: MinIO access key
- `minio_secret_key`: MinIO secret key

## Jenkins Integration

The Jenkins pipelines automatically call these Ansible playbooks:

### Backend Pipeline
```bash
cd ansible
ansible-playbook -i inventory.yml deploy-kubernetes.yml \
    --extra-vars "backend_image=$DOCKER_IMAGE" \
    --extra-vars "frontend_image=papadooo/freelance-frontend:latest"
```

### Frontend Pipeline
```bash
cd ansible
ansible-playbook -i inventory.yml deploy-kubernetes.yml \
    --extra-vars "frontend_image=$DOCKER_IMAGE" \
    --extra-vars "backend_image=papadooo/freelance-backend:latest"
```

## Supported Environments

1. **Kubernetes** (minikube, microk8s, or any k8s cluster)
2. **Docker** (using docker-compose)
3. **VM** (direct installation on Ubuntu/Debian/CentOS)

## Architecture Compliance

This setup follows the DevOps course requirements:

✅ **Ansible Automation (20%)**: Complete automation for all environments
✅ **Kubernetes Support (20%)**: Full k8s deployment with services, ingress
✅ **Docker Support (20%)**: Docker Compose deployment
✅ **CI/CD Integration (15%)**: Jenkins calls Ansible for deployment

## Troubleshooting

### Common Issues

1. **Kubernetes connection issues**
   ```bash
   kubectl cluster-info
   minikube status
   ```

2. **Docker permission issues**
   ```bash
   sudo usermod -aG docker $USER
   # Log out and back in
   ```

3. **Ansible Kubernetes collection missing**
   ```bash
   ansible-galaxy collection install kubernetes.core
   ```

## Usage Examples

### Complete Deployment Flow
```bash
# 1. Start minikube
minikube start --driver=docker
minikube addons enable ingress

# 2. Deploy application
cd ansible
ansible-playbook -i inventory.yml deploy-kubernetes.yml

# 3. Access application
minikube tunnel  # In separate terminal
echo "127.0.0.1 freelance.local" | sudo tee -a /etc/hosts
open http://freelance.local
``` 