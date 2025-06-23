#!/bin/bash

echo "🔄 Ενημέρωση Frontend με νέες αλλαγές..."

# 1. Build το νέο Docker image
echo "1️⃣ Building νέο Docker image..."
cd docker
docker compose build frontend

# 2. Tag το image για Kubernetes
echo "2️⃣ Tagging image για Kubernetes..."
docker tag docker-frontend:latest papadooo/freelance-frontend:latest

# 3. Restart το frontend deployment
echo "3️⃣ Restarting frontend deployment..."
kubectl rollout restart deployment/frontend -n freelance

# 4. Περιμένουμε να ολοκληρωθεί το rollout
echo "4️⃣ Περιμένουμε το rollout να ολοκληρωθεί..."
kubectl rollout status deployment/frontend -n freelance

echo "✅ Frontend ενημερώθηκε επιτυχώς!"

# Δείξε την κατάσταση
kubectl get pods -n freelance -l app=frontend 