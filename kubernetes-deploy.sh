#!/bin/bash

echo "🚀 Ξεκινάει το deployment της FreelancerProject εφαρμογής στο Kubernetes..."

# Έλεγχος αν το kubectl είναι διαθέσιμο
if ! command -v kubectl &> /dev/null; then
    echo "❌ Το kubectl δεν είναι εγκατεστημένο. Παρακαλώ εγκαταστήστε το πρώτα."
    exit 1
fi

# Έλεγχος αν το cluster είναι προσβάσιμο
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Δεν μπορώ να συνδεθώ στο Kubernetes cluster. Βεβαιωθείτε ότι το minikube/cluster τρέχει."
    exit 1
fi

echo "✅ Kubernetes cluster είναι προσβάσιμο"

# Μετάβαση στο φάκελο kubernetes
cd "$(dirname "$0")/kubernetes" || exit 1

echo "📁 Εργάζομαι στο φάκελο: $(pwd)"

# 1. Δημιουργία namespace
echo "1️⃣ Δημιουργία namespace..."
kubectl apply -f namespace.yml

# 2. ConfigMap και Secrets
echo "2️⃣ Εφαρμογή ConfigMap και Secrets..."
kubectl apply -f configmap.yml

# 3. PostgreSQL Database
echo "3️⃣ Deployment PostgreSQL..."
kubectl apply -f postgres-deployment.yml

# 4. MinIO Storage
echo "4️⃣ Deployment MinIO..."
kubectl apply -f minio-deployment.yml

# 5. MailHog
echo "5️⃣ Deployment MailHog..."
kubectl apply -f mailhog-deployment.yml

# 6. Backend Application
echo "6️⃣ Deployment Backend..."
kubectl apply -f backend-deployment.yml

# 7. Frontend Application
echo "7️⃣ Deployment Frontend..."
kubectl apply -f frontend-deployment.yml

# 8. Ingress Rules
echo "8️⃣ Εφαρμογή Ingress rules..."
kubectl apply -f ingress.yml
kubectl apply -f ingress-api.yml
kubectl apply -f ingress-frontend.yml

echo ""
echo "🎉 Το deployment ολοκληρώθηκε!"
echo ""
echo "📊 Έλεγχος κατάστασης pods..."
kubectl get pods -n freelance

echo ""
echo "🌐 Services:"
kubectl get services -n freelance

echo ""
echo "🔗 Ingress:"
kubectl get ingress -n freelance

echo ""
echo "📝 Για να δείτε τα logs:"
echo "   Backend:  kubectl logs -n freelance deployment/backend"
echo "   Frontend: kubectl logs -n freelance deployment/frontend"
echo ""
echo "🌍 Πρόσβαση στην εφαρμογή:"
echo "   Frontend: http://freelance.local"
echo "   Backend API: http://freelance.local/api"
echo ""
echo "💡 Αν χρησιμοποιείτε minikube, εκτελέστε:"
echo "   minikube addons enable ingress"
echo "   echo \"\$(minikube ip) freelance.local\" | sudo tee -a /etc/hosts" 