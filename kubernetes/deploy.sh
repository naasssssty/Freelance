#!/bin/bash

echo "🚀 Deploying Freelance Application to Kubernetes..."

# Create namespace first
echo "📁 Creating namespace..."
kubectl apply -f namespace.yml

# Apply ConfigMap and Secrets
echo "⚙️ Applying configuration..."
kubectl apply -f configmap.yml

# Deploy databases and services
echo "🗄️ Deploying PostgreSQL..."
kubectl apply -f postgres-deployment.yml

echo "💾 Deploying MinIO..."
kubectl apply -f minio-deployment.yml

echo "📧 Deploying MailHog..."
kubectl apply -f mailhog-deployment.yml

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n freelance
kubectl wait --for=condition=available --timeout=300s deployment/minio -n freelance

# Deploy backend
echo "🔧 Deploying Backend..."
kubectl apply -f backend-deployment.yml

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/backend -n freelance

# Deploy frontend
echo "🌐 Deploying Frontend..."
kubectl apply -f frontend-deployment.yml

# Apply Ingress
echo "🌍 Setting up Ingress..."
kubectl apply -f ingress.yml

echo "✅ Deployment completed!"
echo ""
echo "📊 Checking deployment status..."
kubectl get pods -n freelance
echo ""
echo "📡 Services:"
kubectl get svc -n freelance
echo ""
echo "🌐 Ingress:"
kubectl get ingress -n freelance
echo ""
echo "🎉 Freelance application is now running on Kubernetes!"
echo "💡 To access the application, add '127.0.0.1 freelance.local' to your /etc/hosts file"
echo "🔗 Then visit: http://freelance.local" 