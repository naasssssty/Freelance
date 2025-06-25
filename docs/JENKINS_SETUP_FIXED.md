# Jenkins & Kubernetes Setup για Freelance DevOps Project

Αυτός ο οδηγός περιγράφει πώς να ρυθμίσετε το Jenkins για automated deployment στο Kubernetes.

## Προαπαιτούμενα

- Docker Desktop εγκατεστημένο και τρέχει
- Minikube εγκατεστημένο
- kubectl εγκατεστημένο
- Git εγκατεστημένο

## Αυτόματη Εγκατάσταση

### 1. Εκτέλεση του Setup Script

```bash
chmod +x scripts/setup-minikube-jenkins.sh
./scripts/setup-minikube-jenkins.sh
```

Αυτό το script θα:
- Ξεκινήσει το Minikube
- Ενεργοποιήσει το ingress addon
- Δημιουργήσει το σωστό kubeconfig για Jenkins
- Χτίσει τα Docker images
- Ξεκινήσει το Jenkins container
- Ρυθμίσει το minikube tunnel

## Χειροκίνητη Εγκατάσταση

### 1. Εκκίνηση Minikube

```bash
minikube start --driver=docker --memory=4096 --cpus=2
minikube addons enable ingress
```

### 2. Δημιουργία Namespace

```bash
kubectl create namespace freelance
```

### 3. Χτίσιμο Docker Images

```bash
docker build -t papadooo/freelance-backend:latest -f docker/Dockerfile.backend .
docker build -t papadooo/freelance-frontend:latest -f docker/Dockerfile.frontend frontend/
```

### 4. Εκκίνηση Jenkins

```bash
docker-compose -f docker/docker-compose-jenkins.yml up -d
```

### 5. Ρύθμιση Minikube Tunnel

```bash
sudo minikube tunnel
```

## Ρύθμιση Jenkins

### 1. Πρόσβαση στο Jenkins

Ανοίξτε το browser στο: `http://localhost:8081`

### 2. Πρώτη Εγκατάσταση

1. Πάρτε το initial admin password:
```bash
docker exec freelance-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

2. Εγκαταστήστε τα suggested plugins

### 3. Εγκατάσταση Επιπλέον Plugins

Πηγαίνετε στο "Manage Jenkins" > "Manage Plugins" και εγκαταστήστε:

- **Docker Pipeline**
- **Kubernetes CLI Plugin**
- **Ansible Plugin**
- **Build Timeout**
- **Pipeline: Stage View**

### 4. Ρύθμιση Tools

Πηγαίνετε στο "Manage Jenkins" > "Global Tool Configuration":

#### Maven
- Name: `Maven 3`
- Install automatically: ✅
- Version: `3.9.5`

#### JDK
- Name: `JDK 21 Linux`
- Install automatically: ✅
- Version: `jdk-21.0.1+12`

#### NodeJS
- Name: `Node 21`
- Install automatically: ✅
- Version: `21.0.0`

### 5. Ρύθμιση Credentials

Πηγαίνετε στο "Manage Jenkins" > "Manage Credentials" > "System" > "Global credentials":

#### Docker Hub Credentials
- Kind: `Username with password`
- ID: `docker-hub-credentials`
- Username: Το Docker Hub username σας
- Password: Το Docker Hub password σας

#### Kubeconfig File
- Kind: `Secret file`
- ID: `kubeconfig-secret`
- File: Upload το αρχείο `ansible/.kubeconfig`

## Δημιουργία Pipelines

### 1. Backend Pipeline

1. Κάντε κλικ στο "New Item"
2. Name: `Freelance-Backend`
3. Type: `Pipeline`
4. Source Code Management:
   - Repository URL: `https://github.com/naasssssty/Freelance.git`
   - Branch: `*/test`
5. Build Triggers:
   - Poll SCM: `H/5 * * * *` (κάθε 5 λεπτά)
6. Pipeline:
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/naasssssty/Freelance.git`
   - Branch: `*/test`
   - Script Path: `jenkins/Jenkinsfile-backend`

### 2. Frontend Pipeline

Επαναλάβετε τα παραπάνω βήματα με:
- Name: `Freelance-Frontend`
- Script Path: `jenkins/Jenkinsfile-frontend`

## Τρέξιμο των Pipelines

### 1. Εκτέλεση Backend Pipeline

1. Κάντε κλικ στο "Freelance-Backend"
2. Κάντε κλικ στο "Build Now"
3. Παρακολουθήστε τα logs στο "Console Output"

### 2. Εκτέλεση Frontend Pipeline

1. Κάντε κλικ στο "Freelance-Frontend"
2. Κάντε κλικ στο "Build Now"
3. Παρακολουθήστε τα logs στο "Console Output"

## Έλεγχος Deployment

### 1. Έλεγχος Pods

```bash
kubectl get pods -n freelance
```

### 2. Έλεγχος Services

```bash
kubectl get services -n freelance
```

### 3. Έλεγχος Ingress

```bash
kubectl get ingress -n freelance
```

### 4. Πρόσβαση στην Εφαρμογή

Ανοίξτε το browser στο: `http://freelance.local`

## Troubleshooting

### Problem: Kubectl connectivity failed

**Αιτία**: Το Jenkins container δεν μπορεί να συνδεθεί στο Kubernetes cluster.

**Λύση**:
```bash
# Δημιουργήστε νέο kubeconfig
kubectl config view --raw > ansible/.kubeconfig-raw
# Επεξεργαστείτε το αρχείο να έχει host.docker.internal αντί για 127.0.0.1
sed 's/127.0.0.1/host.docker.internal/g' ansible/.kubeconfig-raw > ansible/.kubeconfig
# Ενημερώστε το credential στο Jenkins
```

### Problem: ImagePullBackOff errors

**Αιτία**: Τα Docker images δεν βρίσκονται στο registry.

**Λύση**:
```bash
# Κάντε push τα images στο Docker Hub
docker push papadooo/freelance-backend:latest
docker push papadooo/freelance-frontend:latest
```

### Problem: Ingress δεν λειτουργεί

**Αιτία**: Το minikube tunnel δεν τρέχει.

**Λύση**:
```bash
sudo minikube tunnel
```

### Problem: Pods σε Pending state

**Αιτία**: Ανεπαρκείς πόροι στο Minikube.

**Λύση**:
```bash
minikube stop
minikube start --memory=8192 --cpus=4
```

## Καθαρισμός

Για να σταματήσετε όλα:

```bash
# Σταματήστε το minikube tunnel
sudo kill $(cat /tmp/minikube-tunnel.pid)

# Σταματήστε το Jenkins
docker-compose -f docker/docker-compose-jenkins.yml down

# Σταματήστε το Minikube
minikube stop

# Διαγραφή όλων (προαιρετικά)
minikube delete
docker system prune -f
```

## Χρήσιμες Εντολές

```bash
# Δείτε τα logs ενός pod
kubectl logs -f <pod-name> -n freelance

# Μπείτε σε ένα pod
kubectl exec -it <pod-name> -n freelance -- /bin/bash

# Κάντε port-forward σε μια υπηρεσία
kubectl port-forward service/<service-name> 8080:8080 -n freelance

# Δείτε όλους τους πόρους
kubectl get all -n freelance

# Δείτε τα events
kubectl get events -n freelance --sort-by=.metadata.creationTimestamp
```

## Σημαντικές Παρατηρήσεις

1. **Minikube Tunnel**: Πρέπει να τρέχει για να λειτουργεί το ingress
2. **Docker Images**: Πρέπει να είναι pushed στο Docker Hub για production deployment
3. **Kubeconfig**: Πρέπει να έχει `host.docker.internal` για Jenkins container access
4. **Resources**: Βεβαιωθείτε ότι το Minikube έχει αρκετούς πόρους
5. **Namespace**: Όλοι οι πόροι πρέπει να είναι στο namespace `freelance` 