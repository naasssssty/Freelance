# 🚀 Azure Deployment Guide

## Περιγραφή
Αυτός ο οδηγός εξηγεί πώς να κάνεις deploy την εφαρμογή Freelance στο Azure Kubernetes Service (AKS) μέσω Jenkins CI/CD pipelines.

## 🏗️ Αρχιτεκτονική

### Azure Resources
- **Azure Container Registry (ACR)**: `ergohubregistry.azurecr.io`
- **Azure Kubernetes Service (AKS)**: `ergohub-k8s`
- **Resource Group**: `ergohub-production`
- **Region**: Italy North
- **Application URL**: https://ergohub.duckdns.org

### Jenkins Pipelines
- **Backend Pipeline**: `jenkins/Jenkinsfile-backend`
- **Frontend Pipeline**: `jenkins/Jenkinsfile-frontend`

## 📋 Prerequisites

### 1. Jenkins Configuration
Πρέπει να έχεις ρυθμίσει στο Jenkins:

#### Credentials
Χρειάζεσαι τα παρακάτω credentials στο Jenkins (Manage Jenkins → Credentials):

- **`azure-client-id`** (Secret text): Azure Service Principal Client ID
- **`azure-client-secret`** (Secret text): Azure Service Principal Client Secret  
- **`azure-tenant-id`** (Secret text): Azure Tenant ID

**Πώς να δημιουργήσεις Azure Service Principal:**
```bash
# Δημιουργία Service Principal
az ad sp create-for-rbac --name "jenkins-deployment" --role Contributor --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/ergohub-production

# Το output θα είναι κάτι σαν:
{
  "appId": "your-client-id",           # Αυτό είναι το azure-client-id
  "displayName": "jenkins-deployment",
  "password": "your-client-secret",    # Αυτό είναι το azure-client-secret
  "tenant": "your-tenant-id"           # Αυτό είναι το azure-tenant-id
}

# Δώσε επιπλέον δικαιώματα για ACR
az role assignment create --assignee "your-client-id" --role AcrPush --scope /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/ergohub-production/providers/Microsoft.ContainerRegistry/registries/ergohubregistry
```

#### Tools
- **Maven 3**: Για το backend build
- **JDK 21 Linux**: Για το backend compilation
- **Node 21**: Για το frontend build

### 2. Local Development Setup
```bash
# Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Docker (αν δεν υπάρχει ήδη)
sudo apt-get update
sudo apt-get install docker.io
sudo usermod -aG docker $USER
```

## 🔄 Deployment Process

### Αυτόματο Deployment (Συνιστάται)

#### 1. Git Push Trigger
```bash
# Κάνε τις αλλαγές σου
git add .
git commit -m "Your changes description"
git push origin main
```

#### 2. Jenkins Pipeline Execution
Το Jenkins θα τρέξει αυτόματα τα pipelines όταν ανιχνεύσει αλλαγές στο repository.

**Backend Pipeline Steps:**
1. 🔨 Compile Java code
2. 🧪 Run unit tests
3. 🔗 Run integration tests
4. 📦 Package JAR file
5. ☁️ Login to Azure & ACR
6. 🐳 Build & push Docker image
7. 🚀 Deploy to AKS
8. ✅ Health check

**Frontend Pipeline Steps:**
1. 📦 Install npm dependencies
2. 🔍 ESLint code quality check
3. 🧪 Run unit tests
4. 🔗 Run integration tests
5. 🏗️ Build React application
6. 🔒 Security audit
7. ☁️ Login to Azure & ACR
8. 🐳 Build & push Docker image
9. 🚀 Deploy to AKS
10. ✅ Health check & verification

### Manual Deployment (Εφεδρικό)

#### 1. Quick Deploy Script
```bash
# Χρησιμοποίησε το γρήγορο script για manual deployment
./quick-deploy.sh
```

#### 2. Step-by-Step Manual Process
```bash
# 1. Login to Azure
az login

# 2. Get AKS credentials
az aks get-credentials --resource-group ergohub-production --name ergohub-k8s

# 3. Login to ACR
az acr login --name ergohubregistry

# 4. Build images
docker build -t ergohubregistry.azurecr.io/freelance-backend:latest -f docker/Dockerfile.backend .
docker build -t ergohubregistry.azurecr.io/freelance-frontend:latest -f docker/Dockerfile.frontend frontend/

# 5. Push images
docker push ergohubregistry.azurecr.io/freelance-backend:latest
docker push ergohubregistry.azurecr.io/freelance-frontend:latest

# 6. Restart deployments to pull new images
kubectl rollout restart deployment/backend -n freelance
kubectl rollout restart deployment/frontend -n freelance

# 7. Wait for completion
kubectl rollout status deployment/backend -n freelance
kubectl rollout status deployment/frontend -n freelance
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Pipeline Fails at Azure Login
```bash
# Check if service principal credentials are correct
az login --service-principal -u $CLIENT_ID -p $CLIENT_SECRET --tenant $TENANT_ID
```

#### 2. Docker Push Fails
```bash
# Ensure ACR login is successful
az acr login --name ergohubregistry
docker push ergohubregistry.azurecr.io/your-image:tag
```

#### 3. Kubectl Connection Issues
```bash
# Refresh AKS credentials
az aks get-credentials --resource-group ergohub-production --name ergohub-k8s --overwrite-existing

# Test connection
kubectl get nodes
```

#### 4. Pods Not Starting
```bash
# Check pod status
kubectl get pods -n freelance

# Check pod logs
kubectl logs <pod-name> -n freelance

# Check events
kubectl get events -n freelance --sort-by='.lastTimestamp'
```

### Monitoring Commands

```bash
# Check deployment status
kubectl get deployments -n freelance

# Check pod status
kubectl get pods -n freelance

# Check services
kubectl get svc -n freelance

# Check ingress
kubectl get ingress -n freelance

# View logs
kubectl logs -f deployment/backend -n freelance
kubectl logs -f deployment/frontend -n freelance
```

## 📊 Pipeline Status & Logs

### Jenkins UI Access
- Navigate to your Jenkins instance
- Check pipeline status in the dashboard
- View detailed logs for each stage

### Pipeline Artifacts
- **Backend**: JAR files, test reports, coverage reports
- **Frontend**: Build artifacts, test coverage, bundle analysis

## 🔐 Security Notes

### Credentials Management
- Service Principal credentials are stored securely in Jenkins
- No hardcoded secrets in pipeline files
- Images are scanned for vulnerabilities during build

### Network Security
- AKS cluster uses private networking
- Application accessible only through configured ingress
- SSL/TLS termination at ingress level

## 📈 Performance Optimization

### Build Optimization
- Docker layer caching enabled
- npm ci used for faster frontend builds
- Parallel test execution where possible

### Resource Management
- Automatic cleanup of old Docker images
- Resource limits set for all containers
- Horizontal Pod Autoscaling configured

## 🆘 Support

### Logs Location
- **Jenkins**: Jenkins UI → Pipeline → Console Output
- **Kubernetes**: `kubectl logs` commands
- **Azure**: Azure Portal → AKS → Insights

### Contact
Για υποστήριξη, ελέγξτε:
1. Pipeline logs στο Jenkins
2. Pod logs στο Kubernetes
3. Azure Portal για infrastructure issues

---

**🎉 Congratulations!** Η εφαρμογή σου είναι τώρα deployed στο Azure με πλήρη CI/CD automation! 