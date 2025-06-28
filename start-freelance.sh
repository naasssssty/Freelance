#!/bin/bash

echo "🚀 Starting Freelance Application..."

# 1. Start minikube
echo "📦 Starting minikube..."
minikube start
minikube tunnel

# 2. Enable ingress addon
echo "🌐 Enabling ingress addon..."
minikube addons enable ingress

# 3. Start kubectl proxy
nohup kubectl proxy --address='0.0.0.0' --port=8090 --accept-hosts='^.*' > kubectl-proxy.log 2>&1 &

# 4. Apply all Kubernetes configurations
echo "⚙️  Applying Kubernetes configurations..."
kubectl apply -f kubernetes/

# 5. Wait for pods to be ready
echo "⏳ Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod --all -n freelance --timeout=300s

# 6. Check pod status
echo "📊 Checking pod status..."
kubectl get pods -n freelance

# 7. Get minikube IP and update /etc/hosts if needed
MINIKUBE_IP=$(minikube ip)
echo "🔗 Minikube IP: $MINIKUBE_IP"

# Check if hosts entry exists
if ! grep -q "freelance.local" /etc/hosts; then
    echo "📝 Adding entries to /etc/hosts..."
    echo "$MINIKUBE_IP freelance.local mailhog.freelance.local minio.freelance.local" | sudo tee -a /etc/hosts
else
    echo "✅ Hosts entries already exist"
fi

echo ""
echo "🎉 Application is ready!"
echo ""
echo "📱 Access URLs:"
echo "   Main App:  http://freelance.local"
echo "   MailHog:   http://mailhog.freelance.local"
echo "   MinIO:     http://minio.freelance.local"
echo ""
echo "🔑 Default Credentials:"
echo "   Admin Login: admin / adminpassword "
echo "   MinIO: Check with 'kubectl get secret freelance-secrets -n freelance -o yaml'"
echo ""
echo "📊 Monitor with: kubectl get pods -n freelance" 
