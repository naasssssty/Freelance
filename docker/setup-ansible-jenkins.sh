#!/bin/bash

# Setup script for Ansible in Jenkins Docker container
# This script should be run inside the Jenkins container to install Ansible and dependencies

set -e

echo "🚀 Setting up Ansible in Jenkins Docker container..."

# Update package list
echo "📦 Updating package list..."
apt-get update

# Install required system packages
echo "🔧 Installing system dependencies..."
apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    curl \
    git \
    openssh-client \
    sshpass \
    rsync

# Install Ansible
echo "🎭 Installing Ansible..."
pip3 install --upgrade pip
pip3 install ansible

# Install required Python packages for Kubernetes
echo "🐍 Installing Python packages for Kubernetes..."
pip3 install \
    kubernetes==24.2.0 \
    openshift \
    pyyaml \
    jsonpatch \
    requests \
    urllib3

# Install Ansible collections
echo "📚 Installing Ansible collections..."
ansible-galaxy collection install kubernetes.core --force
ansible-galaxy collection install ansible.posix --force
ansible-galaxy collection install community.general --force

# Create Ansible configuration directory
echo "📁 Creating Ansible configuration..."
mkdir -p /etc/ansible
mkdir -p ~/.ansible

# Create ansible.cfg
cat > /etc/ansible/ansible.cfg << 'EOF'
[defaults]
host_key_checking = False
stdout_callback = yaml
force_color = True
gathering = smart
fact_caching = memory
retry_files_enabled = False
timeout = 30
pipelining = True

[ssh_connection]
ssh_args = -o ControlMaster=auto -o ControlPersist=60s -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no
EOF

# Create local ansible.cfg in workspace
cat > ~/.ansible.cfg << 'EOF'
[defaults]
host_key_checking = False
stdout_callback = yaml
force_color = True
gathering = smart
fact_caching = memory
retry_files_enabled = False
timeout = 30
pipelining = True

[ssh_connection]
ssh_args = -o ControlMaster=auto -o ControlPersist=60s -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no
EOF

# Set environment variables for Ansible
echo "🌍 Setting up environment variables..."
cat >> ~/.bashrc << 'EOF'

# Ansible environment variables
export ANSIBLE_HOST_KEY_CHECKING=False
export ANSIBLE_STDOUT_CALLBACK=yaml
export ANSIBLE_FORCE_COLOR=true
export ANSIBLE_GATHERING=smart
export ANSIBLE_FACT_CACHING=memory
export ANSIBLE_RETRY_FILES_ENABLED=False
export ANSIBLE_TIMEOUT=30
export ANSIBLE_PIPELINING=True
EOF

# Verify installation
echo "✅ Verifying Ansible installation..."
ansible --version
ansible-galaxy collection list

echo "🎉 Ansible setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "- Ansible version: $(ansible --version | head -1)"
echo "- Python version: $(python3 --version)"
echo "- Kubectl support: $(pip3 show kubernetes | grep Version || echo 'Not installed')"
echo "- Collections installed:"
ansible-galaxy collection list | grep -E "(kubernetes|ansible|community)" || echo "  No collections found"

echo ""
echo "🔧 Next steps:"
echo "1. Ensure kubectl is available in the container"
echo "2. Configure Azure CLI credentials"
echo "3. Test the deployment with: ansible-playbook -i ansible/inventory.yml ansible/deploy-azure-k8s.yml --check"
echo ""
echo "✨ Ready to deploy with Ansible!" 