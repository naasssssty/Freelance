# 🚀 Deployment Guide - Dual Environment Setup

## Περιγραφή
Αυτός ο οδηγός εξηγεί πώς να χρησιμοποιήσεις τα **δύο ξεχωριστά deployment environments** που έχουν ρυθμιστεί:

1. **🌩️ Azure AKS** (Production Environment)
2. **🔧 Minikube** (Presentation/Demo Environment)

---

## 🏗️ Αρχιτεκτονική

### Azure Production Environment
- **Target**: Azure Kubernetes Service (AKS)
- **Container Registry**: Azure Container Registry (ACR)
- **Domain**: https://ergohub.duckdns.org
- **Use Case**: Production deployment, live application

### Minikube Demo Environment  
- **Target**: Local Minikube cluster
- **Container Registry**: Docker Hub
- **Access**: Local URLs via minikube service
- **Use Case**: Presentation, demos, local development

---

## 📁 Δομή Αρχείων

```
📦 Freelance Project
├── 🌩️ Azure Production Files
│   ├── jenkins/Jenkinsfile-backend          # Azure backend pipeline
│   ├── jenkins/Jenkinsfile-frontend         # Azure frontend pipeline
│   ├── docker/Dockerfile.backend            # Azure backend Docker
│   ├── docker/Dockerfile.frontend           # Azure frontend Docker
│   └── ansible/deploy-kubernetes.yml        # Azure deployment
│
├── 🔧 Minikube Demo Files
│   ├── jenkins/Jenkinsfile-backend-minikube     # Minikube backend pipeline
│   ├── jenkins/Jenkinsfile-frontend-minikube    # Minikube frontend pipeline
│   ├── docker/Dockerfile.backend.minikube       # Minikube backend Docker
│   ├── docker/Dockerfile.frontend.minikube      # Minikube frontend Docker
│   └── ansible/deploy-kubernetes-minikube.yml   # Minikube deployment
│
└── 📚 Documentation
    ├── AZURE_DEPLOYMENT.md              # Azure setup guide
    └── DEPLOYMENT_GUIDE.md              # This file
```

---

## 🌩️ Azure Production Deployment

### Χρήση:
```bash
# Automatic deployment via Git push
git add .
git commit -m "Your changes"
git push origin main
```

### Jenkins Pipelines:
- **Backend**: `Freelance-Backend` (uses `Jenkinsfile-backend`)
- **Frontend**: `Freelance-Frontend` (uses `Jenkinsfile-frontend`)

### Χαρακτηριστικά:
- ✅ Azure CLI container για authentication
- ✅ Token-based ACR login
- ✅ Automatic scaling
- ✅ Production-grade resources
- ✅ SSL/TLS termination
- ✅ External domain access

### Access:
- **Application**: https://ergohub.duckdns.org
- **Monitoring**: Azure Portal → AKS → Insights

---

## 🔧 Minikube Demo Deployment

### Prerequisites:
```bash
# Start minikube
minikube start

# Enable necessary addons
minikube addons enable ingress
minikube addons enable dashboard
```

### Jenkins Pipelines:
- **Backend**: `Freelance-Backend-Minikube` (uses `Jenkinsfile-backend-minikube`)
- **Frontend**: `Freelance-Frontend-Minikube` (uses `Jenkinsfile-frontend-minikube`)

### Manual Deployment:
```bash
# Build and deploy to minikube
docker build -t papadooo/freelance-backend:demo -f docker/Dockerfile.backend.minikube .
docker build -t papadooo/freelance-frontend:demo -f docker/Dockerfile.frontend.minikube frontend/

# Push to Docker Hub
docker push papadooo/freelance-backend:demo
docker push papadooo/freelance-frontend:demo

# Deploy with Ansible
ansible-playbook ansible/deploy-kubernetes-minikube.yml -i ansible/inventory.yml
```

### Access:
```bash
# Get application URL
minikube service frontend -n freelance

# Or use port forwarding
kubectl port-forward svc/frontend 8080:80 -n freelance
# Then access: http://localhost:8080

# Dashboard
minikube dashboard
```

### Χαρακτηριστικά:
- ✅ Local development environment
- ✅ Lightweight resource usage
- ✅ Easy demo setup
- ✅ Docker Hub integration
- ✅ Simple nginx configuration

---

## 🔄 Switching Between Environments

### For Presentation (Minikube):
1. **Setup Jenkins jobs** pointing to minikube Jenkinsfiles
2. **Start minikube**: `minikube start`
3. **Run minikube pipelines** in Jenkins
4. **Access via**: `minikube service frontend -n freelance`

### For Production (Azure):
1. **Use default Jenkins jobs** (Azure pipelines)
2. **Push to Git** → Automatic deployment
3. **Access via**: https://ergohub.duckdns.org

---

## 🛠️ Jenkins Configuration

### Required Credentials:

#### For Azure:
- `azure-client-id` (Secret text)
- `azure-client-secret` (Secret text)  
- `azure-tenant-id` (Secret text)

#### For Minikube:
- `docker-hub-credentials` (Username/Password)
- `kubeconfig-secret` (Secret file)

### Pipeline Setup:

#### Azure Pipelines (Default):
```groovy
// jenkins/Jenkinsfile-backend
// jenkins/Jenkinsfile-frontend
```

#### Minikube Pipelines (For Demos):
```groovy
// jenkins/Jenkinsfile-backend-minikube  
// jenkins/Jenkinsfile-frontend-minikube
```

---

## 📊 Comparison

| Feature | Azure AKS | Minikube |
|---------|-----------|----------|
| **Environment** | Production | Demo/Local |
| **Scalability** | Auto-scaling | Single node |
| **Registry** | Azure ACR | Docker Hub |
| **Access** | Public domain | Local URLs |
| **Resources** | High availability | Lightweight |
| **SSL** | Automatic | Manual setup |
| **Cost** | Azure pricing | Free |
| **Use Case** | Live application | Presentations |

---

## 🎯 Για την Παρουσίαση

### Προετοιμασία:
1. **Start minikube**: `minikube start`
2. **Create Jenkins jobs** για minikube pipelines
3. **Test deployment** με τα minikube Jenkinsfiles
4. **Prepare demo URLs**: `minikube service list -n freelance`

### During Presentation:
1. **Show Jenkins pipelines** (minikube versions)
2. **Demonstrate deployment process**
3. **Access application** via minikube service
4. **Show Kubernetes dashboard**: `minikube dashboard`

### Key Points to Highlight:
- ✅ **Dual environment setup** (Production + Demo)
- ✅ **CI/CD automation** with Jenkins
- ✅ **Containerization** with Docker
- ✅ **Orchestration** with Kubernetes
- ✅ **Infrastructure as Code** with Ansible

---

## 🆘 Troubleshooting

### Minikube Issues:
```bash
# Restart minikube
minikube stop && minikube start

# Check status
minikube status
kubectl get pods -n freelance

# View logs
kubectl logs -f deployment/backend -n freelance
```

### Azure Issues:
```bash
# Check AKS status
az aks show --resource-group ergohub-production --name ergohub-k8s

# View pods
kubectl get pods -n freelance

# Check deployment
kubectl rollout status deployment/backend -n freelance
```

---

## 📝 Notes

- **Azure pipelines** είναι οι default για production
- **Minikube pipelines** χρησιμοποιούνται μόνο για demos
- **Docker images** χρησιμοποιούν διαφορετικά registries
- **Resource limits** είναι διαφορετικά για κάθε environment
- **Networking** configuration διαφέρει ανάμεσα στα environments

---

**🎉 Τώρα έχεις ξεχωριστά environments για production και presentation!** 