#!/bin/bash

echo "🔄 Ενημέρωση Backend με νέες αλλαγές..."

# 1. Build το νέο Docker image
echo "1️⃣ Building νέο Docker image..."
cd docker
docker compose build backend

# 2. Tag το image για Kubernetes
echo "2️⃣ Tagging image για Kubernetes..."
docker tag docker-backend:latest papadooo/freelance-backend:latest

# 3. Restart το backend deployment
echo "3️⃣ Restarting backend deployment..."
kubectl rollout restart deployment/backend -n freelance

# 4. Περιμένουμε να ολοκληρωθεί το rollout
echo "4️⃣ Περιμένουμε το rollout να ολοκληρωθεί..."
kubectl rollout status deployment/backend -n freelance

echo "✅ Backend ενημερώθηκε επιτυχώς!"

# Δείξε την κατάσταση
kubectl get pods -n freelance -l app=backend 