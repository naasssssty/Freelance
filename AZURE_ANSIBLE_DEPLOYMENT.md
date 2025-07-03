# 🚀 Azure Kubernetes Deployment με Ansible

## Περιγραφή

Αυτός ο οδηγός εξηγεί πώς να κάνεις deploy την εφαρμογή Freelance στο Azure Kubernetes Service (AKS) χρησιμοποιώντας **Ansible playbooks** μέσω Jenkins CI/CD pipelines, αντί για άμεσες κλήσεις `kubectl`.

## 🏗️ Αρχιτεκτονική

### Νέα Αρχιτεκτονική με Ansible
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Git Push      │───▶│  Jenkins        │───▶│  Ansible        │
│   (Trigger)     │    │  (Docker)       │    │  Playbooks      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ▲                       │
                                │                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Azure CLI      │    │  Azure AKS      │
                       │  (Container)    │    │  (Target)       │
                       └─────────────────┘    └─────────────────┘
```

### Πλεονεκτήματα της Ansible Προσέγγισης
- **🔄 Declarative**: Ορίζεις την επιθυμητή κατάσταση, όχι τα βήματα
- **🔁 Idempotent**: Μπορεί να τρέξει πολλές φορές με το ίδιο αποτέλεσμα
- **📋 Structured**: Καλύτερη οργάνωση και διαχείριση του deployment
- **🔍 Visibility**: Καλύτερη παρακολούθηση και logging
- **🛡️ Error Handling**: Πιο εξελιγμένος χειρισμός σφαλμάτων
- **🎯 Reusability**: Επαναχρησιμοποίηση playbooks σε διαφορετικά περιβάλλοντα

## 📁 Δομή Αρχείων

```
├── ansible/
│   ├── deploy-azure-k8s.yml          # Κύριο Azure deployment playbook
│   ├── inventory.yml                 # Inventory με Azure configurations
│   └── deploy-kubernetes.yml         # Γενικό Kubernetes playbook
├── jenkins/
│   ├── Jenkinsfile-backend-ansible   # Backend pipeline με Ansible
│   ├── Jenkinsfile-frontend-ansible  # Frontend pipeline με Ansible
│   ├── Jenkinsfile-backend          # Παλιό backend pipeline (kubectl)
│   └── Jenkinsfile-frontend         # Παλιό frontend pipeline (kubectl)
├── docker/
│   └── setup-ansible-jenkins.sh     # Script για Ansible setup σε Jenkins
└── AZURE_ANSIBLE_DEPLOYMENT.md      # Αυτό το αρχείο
```

## 🔧 Προετοιμασία

### 1. Jenkins Configuration

#### Credentials (ίδια με πριν)
- **`azure-client-id`**: Azure Service Principal Client ID
- **`azure-client-secret`**: Azure Service Principal Client Secret  
- **`azure-tenant-id`**: Azure Tenant ID

#### Tools
- **Maven 3**: Για backend build
- **JDK 21 Linux**: Για backend compilation
- **Node 21**: Για frontend build

### 2. Ansible Setup στο Jenkins Container

Το Jenkins container πρέπει να έχει εγκατεστημένο το Ansible. Αυτό γίνεται αυτόματα στα νέα pipelines, αλλά μπορείς να το κάνεις και manually:

```bash
# Μέσα στο Jenkins container
docker exec -it jenkins-container bash
./docker/setup-ansible-jenkins.sh
```

### 3. Azure Resources (ίδια με πριν)
- **Azure Container Registry (ACR)**: `ergohubregistry.azurecr.io`
- **Azure Kubernetes Service (AKS)**: `ergohub-k8s`
- **Resource Group**: `ergohub-production`

## 🚀 Deployment Process

### Αυτόματο Deployment

#### 1. Git Push Trigger
```bash
git add .
git commit -m "Deploy with Ansible"
git push origin main
```

#### 2. Jenkins Pipeline Execution

**Backend Pipeline Steps (Jenkinsfile-backend-ansible):**
1. 🔨 Compile Java code
2. 🧪 Run unit tests
3. 🔗 Run integration tests
4. 📦 Package JAR file
5. 🎭 **Setup Ansible environment**
6. ☁️ Login to Azure & ACR
7. 🐳 Build & push Docker image
8. 🎯 **Deploy to AKS using Ansible**
9. ✅ **Post-deployment verification with Ansible**

**Frontend Pipeline Steps (Jenkinsfile-frontend-ansible):**
1. 📦 Install npm dependencies
2. 🔍 ESLint code quality check
3. 🧪 Run unit tests
4. 🔗 Run integration tests
5. 🏗️ Build React application
6. 🔒 Security audit
7. 🎭 **Setup Ansible environment**
8. ☁️ Login to Azure & ACR
9. 🐳 Build & push Docker image
10. 🎯 **Deploy to AKS using Ansible**
11. ✅ **Post-deployment verification with Ansible**
12. 📊 Performance check

### Manual Deployment

#### 1. Χρήση Ansible Playbook
```bash
# Άμεσο deployment με Ansible
export KUBECONFIG=./kubeconfig
ansible-playbook -i ansible/inventory.yml ansible/deploy-azure-k8s.yml \
    -e "backend_docker_image=ergohubregistry.azurecr.io/freelance-backend:latest" \
    -e "frontend_docker_image=ergohubregistry.azurecr.io/freelance-frontend:latest" \
    -e "kubeconfig_path=./kubeconfig" \
    -v
```

#### 2. Παραμετροποίηση Deployment
```bash
# Deployment με custom παραμέτρους
ansible-playbook -i ansible/inventory.yml ansible/deploy-azure-k8s.yml \
    -e "backend_docker_image=ergohubregistry.azurecr.io/freelance-backend:v1.2.3" \
    -e "frontend_docker_image=ergohubregistry.azurecr.io/freelance-frontend:v1.2.3" \
    -e "app_namespace=freelance-staging" \
    -e "azure_aks_cluster=ergohub-k8s-staging" \
    --check  # Dry run
```

## 📊 Monitoring & Troubleshooting

### Ansible Playbook Logs
```bash
# Τρέξε με verbose output
ansible-playbook -i ansible/inventory.yml ansible/deploy-azure-k8s.yml -vvv

# Τρέξε με dry run για έλεγχο
ansible-playbook -i ansible/inventory.yml ansible/deploy-azure-k8s.yml --check
```

### Kubernetes Status
```bash
# Check deployment status
kubectl get deployments -n freelance
kubectl get pods -n freelance
kubectl get svc -n freelance
kubectl get ingress -n freelance

# Check logs
kubectl logs -f deployment/backend -n freelance
kubectl logs -f deployment/frontend -n freelance
```

### Common Issues & Solutions

#### 1. Ansible Not Found in Jenkins
```bash
# Εγκατάσταση Ansible στο Jenkins container
docker exec -it jenkins-container bash
apt-get update && apt-get install -y python3-pip
pip3 install ansible
ansible-galaxy collection install kubernetes.core
```

#### 2. Kubernetes Connection Issues
```bash
# Refresh AKS credentials
az aks get-credentials --resource-group ergohub-production --name ergohub-k8s --overwrite-existing

# Test connection
export KUBECONFIG=./kubeconfig
kubectl get nodes
```

#### 3. Ansible Playbook Failures
```bash
# Check syntax
ansible-playbook ansible/deploy-azure-k8s.yml --syntax-check

# Run specific tasks
ansible-playbook -i ansible/inventory.yml ansible/deploy-azure-k8s.yml --tags "backend"

# Skip certain tasks
ansible-playbook -i ansible/inventory.yml ansible/deploy-azure-k8s.yml --skip-tags "health-check"
```

## 🔄 Σύγκριση με Παλιά Προσέγγιση

### Παλιά Προσέγγιση (kubectl)
```bash
# Στο Jenkins pipeline
kubectl set image deployment/backend backend=$DOCKER_IMAGE -n freelance
kubectl rollout status deployment/backend -n freelance --timeout=300s
```

### Νέα Προσέγγιση (Ansible)
```yaml
# Στο Ansible playbook
- name: Update backend deployment with new image
  kubernetes.core.k8s:
    kubeconfig: "{{ kubeconfig_path }}"
    state: present
    definition:
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: backend
        namespace: "{{ namespace }}"
      spec:
        template:
          spec:
            containers:
            - name: backend
              image: "{{ backend_image }}"
```

### Πλεονεκτήματα Νέας Προσέγγισης
- **Καλύτερη οργάνωση**: Όλα τα deployment configurations σε ένα μέρος
- **Επαναχρησιμοποίηση**: Το ίδιο playbook για διαφορετικά περιβάλλοντα
- **Καλύτερος έλεγχος**: Πιο εξελιγμένος χειρισμός σφαλμάτων
- **Τυποποίηση**: Consistent deployment process
- **Auditing**: Καλύτερη παρακολούθηση των αλλαγών

## 🎯 Βέλτιστες Πρακτικές

### 1. Playbook Organization
```yaml
# Χρησιμοποίησε tags για selective execution
- name: Deploy backend
  kubernetes.core.k8s:
    # ... configuration
  tags: 
    - backend
    - application
```

### 2. Variable Management
```yaml
# Χρησιμοποίησε default values
backend_image: "{{ backend_docker_image | default('ergohubregistry.azurecr.io/freelance-backend:latest') }}"
```

### 3. Error Handling
```yaml
# Χρησιμοποίησε proper error handling
- name: Check deployment status
  kubernetes.core.k8s_info:
    # ... configuration
  register: deployment_status
  failed_when: deployment_status.resources | length == 0
```

### 4. Security
```yaml
# Μη αποθηκεύεις sensitive data στο playbook
- name: Apply secrets
  kubernetes.core.k8s:
    definition:
      apiVersion: v1
      kind: Secret
      metadata:
        name: app-secrets
      data:
        password: "{{ vault_password | b64encode }}"
```

## 📋 Checklist για Migration

### Pre-Migration
- [ ] Backup existing deployments
- [ ] Test Ansible playbooks locally
- [ ] Verify Jenkins container has Ansible
- [ ] Confirm Azure credentials work

### Migration Steps
- [ ] Update Jenkins pipelines to use new Jenkinsfiles
- [ ] Test deployment with staging environment
- [ ] Monitor first production deployment
- [ ] Update documentation and runbooks

### Post-Migration
- [ ] Archive old kubectl-based pipelines
- [ ] Train team on new Ansible approach
- [ ] Set up monitoring for Ansible executions
- [ ] Document lessons learned

## 🔗 Χρήσιμα Links

- [Ansible Kubernetes Collection](https://docs.ansible.com/ansible/latest/collections/kubernetes/core/)
- [Azure AKS Documentation](https://docs.microsoft.com/en-us/azure/aks/)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Ansible Best Practices](https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html)

## 📞 Support

Για προβλήματα με το deployment:
1. Έλεγξε τα Jenkins logs
2. Τρέξε το Ansible playbook με `-vvv` για verbose output
3. Επιβεβαίωσε ότι το AKS cluster είναι προσβάσιμο
4. Έλεγξε τα Kubernetes events: `kubectl get events -n freelance`

---

**Σημείωση**: Αυτή η νέα προσέγγιση με Ansible αντικαθιστά τις άμεσες κλήσεις `kubectl` στα Jenkins pipelines, παρέχοντας πιο structured, maintainable και scalable deployment process. 