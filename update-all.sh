#!/bin/bash

echo "🔄 Ενημέρωση όλης της εφαρμογής με νέες αλλαγές..."

# 1. Build όλα τα Docker images
echo "1️⃣ Building όλα τα Docker images..."
cd docker
docker compose build

# 2. Tag τα images για Kubernetes
echo "2️⃣ Tagging images για Kubernetes..."
docker tag docker-backend:latest papadooo/freelance-backend:latest
docker tag docker-frontend:latest papadooo/freelance-frontend:latest

# 3. Restart όλα τα deployments
echo "3️⃣ Restarting όλα τα deployments..."
kubectl rollout restart deployment/backend -n freelance
kubectl rollout restart deployment/frontend -n freelance

# 4. Περιμένουμε να ολοκληρωθούν τα rollouts
echo "4️⃣ Περιμένουμε τα rollouts να ολοκληρωθούν..."
kubectl rollout status deployment/backend -n freelance
kubectl rollout status deployment/frontend -n freelance

echo "✅ Όλη η εφαρμογή ενημερώθηκε επιτυχώς!"

# Δείξε την κατάσταση
echo ""
echo "📊 Κατάσταση pods:"
kubectl get pods -n freelance 