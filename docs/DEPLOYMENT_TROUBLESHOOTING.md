# Jenkins Deployment Troubleshooting Guide

## Προβλήματα που Επιλύθηκαν

### 1. 🔧 Jenkins ansiblePlaybook Plugin Issue

**Πρόβλημα:** Το Jenkins pipeline απέτυχε με το σφάλμα:
```
SynchronousResumeNotSupportedException: The Pipeline step `ansiblePlaybook` cannot be resumed after a controller restart
```

**Αιτία:** Το `ansiblePlaybook` plugin step δεν μπορεί να συνεχιστεί μετά από restart του Jenkins controller.

**Λύση:** Αντικατάσταση του `ansiblePlaybook` plugin με απευθείας κλήση του `ansible-playbook` command:

```groovy
// ΠΡΙΝ (προβληματικό)
ansiblePlaybook(
    playbook: 'ansible/deploy-kubernetes.yml',
    inventory: 'ansible/inventory.yml',
    installation: 'DefaultAnsible',
    extraVars: [
        backend_image: "$DOCKER_IMAGE"
    ]
)

// ΜΕΤΑ (διορθωμένο)
sh '''
    cd ansible
    ansible-playbook deploy-kubernetes.yml \
        -i inventory.yml \
        --extra-vars "backend_image=${DOCKER_IMAGE}" \
        --extra-vars "frontend_image=papadooo/freelance-frontend:latest"
'''
```

### 2. 🎯 Ansible Reserved Variable Warning

**Πρόβλημα:** Warning για χρήση reserved variable name:
```
[WARNING]: Found variable using reserved name: namespace
```

**Λύση:** Αλλαγή της μεταβλητής `namespace` σε `app_namespace`:

```yaml
# ΠΡΙΝ
vars:
  namespace: "freelance"

# ΜΕΤΑ  
vars:
  app_namespace: "freelance"
```

### 3. 🔌 Kubernetes Cluster Connectivity Issue

**Πρόβλημα:** Το Ansible δεν μπορούσε να συνδεθεί στο Kubernetes cluster:
```
urllib3.exceptions.MaxRetryError: HTTPSConnectionPool(host='192.168.49.2', port=8443): 
Max retries exceeded with url: /version (Caused by ConnectTimeoutError)
```

**Αιτία:** Το minikube cluster δεν τρέχει ή δεν είναι προσβάσιμο.

**Λύση:** Προσθήκη pre-deployment step που εξασφαλίζει ότι το cluster τρέχει:

```bash
# Δημιουργία script: scripts/ensure-k8s-cluster.sh
./scripts/ensure-k8s-cluster.sh
```

## Βήματα Επιδιόρθωσης

### 1. Ενημέρωση Jenkins Pipelines

✅ **Backend Pipeline** (`jenkins/Jenkinsfile-backend`):
- Αντικατάσταση `ansiblePlaybook` με `sh` command
- Προσθήκη cluster readiness check

✅ **Frontend Pipeline** (`jenkins/Jenkinsfile-frontend`):
- Διόρθωση inventory usage
- Προσθήκη cluster readiness check

### 2. Διόρθωση Ansible Playbook

✅ **Ansible Playbook** (`ansible/deploy-kubernetes.yml`):
- Αλλαγή `namespace` σε `app_namespace`
- Διόρθωση YAML structure

### 3. Προσθήκη Cluster Management

✅ **Cluster Setup Script** (`scripts/ensure-k8s-cluster.sh`):
- Έλεγχος minikube status
- Αυτόματη εκκίνηση αν χρειάζεται
- Setup kubeconfig για Jenkins

## Πώς να Τρέξετε το Deployment

### Μέθοδος 1: Μέσω Jenkins Pipeline

1. **Ξεκινήστε το Jenkins:**
   ```bash
   cd docker
   docker-compose up -d jenkins
   ```

2. **Εκτελέστε το pipeline:**
   - Backend: `http://localhost:8081/job/Freelance-Backend/`
   - Frontend: `http://localhost:8081/job/Freelance-Frontend/`

### Μέθοδος 2: Τοπικά (για testing)

1. **Εξασφαλίστε ότι το cluster τρέχει:**
   ```bash
   chmod +x scripts/ensure-k8s-cluster.sh
   ./scripts/ensure-k8s-cluster.sh
   ```

2. **Εκτελέστε το Ansible playbook:**
   ```bash
   cd ansible
   ansible-playbook deploy-kubernetes.yml -i inventory.yml \
       --extra-vars "backend_image=papadooo/freelance-backend:latest" \
       --extra-vars "frontend_image=papadooo/freelance-frontend:latest"
   ```

## Έλεγχος Deployment

### Cluster Status
```bash
kubectl get pods -n freelance
kubectl get services -n freelance
kubectl get ingress -n freelance
```

### Application Access
```bash
# Εάν χρησιμοποιείτε minikube
minikube tunnel  # Σε ξεχωριστό terminal

# Προσθήκη στο /etc/hosts
echo "$(minikube ip) freelance.local" | sudo tee -a /etc/hosts

# Πρόσβαση
curl http://freelance.local
```

## Συχνά Προβλήματα

### Jenkins Container δεν έχει πρόσβαση στο minikube

**Λύση:** Βεβαιωθείτε ότι το Jenkins container μπορεί να έχει πρόσβαση στο Docker daemon:
```bash
# Στο docker-compose.yml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
  - ~/.kube:/var/jenkins_home/.kube:ro
```

### Ansible Kubernetes Collection Missing

**Λύση:**
```bash
ansible-galaxy collection install kubernetes.core
```

### Permission Issues με Docker

**Λύση:**
```bash
sudo usermod -aG docker $USER
# Logout και login ξανά
```

## Επόμενα Βήματα

1. ✅ Jenkins pipeline τρέχει χωρίς σφάλματα
2. ✅ Kubernetes deployment επιτυχής
3. 🔄 Monitoring και logging setup
4. 🔄 Production-ready configuration
5. 🔄 Automated testing integration

---

*Ημερομηνία τελευταίας ενημέρωσης: Ιούνιος 2025* 