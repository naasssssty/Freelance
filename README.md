# 📌 TestFreelancerProject

## 📖 Περιγραφή της Εφαρμογής
Η εφαρμογή **FreelancerProject** είναι μια πλατφόρμα διαχείρισης έργων πληροφορικής για freelancers. Επιτρέπει στους πελάτες να δημοσιεύουν έργα, στους ελεύθερους επαγγελματίες να υποβάλλουν αιτήσεις και στον διαχειριστή να εγκρίνει έργα και προφίλ.

## 👥 Ρόλοι Χρηστών
1. **Διαχειριστής (Admin)**
    - Επιβεβαιώνει νέες καταχωρίσεις έργων.
    - Επαληθεύει τα προφίλ των ελεύθερων επαγγελματιών.
    - Διαχειρίζεται διαφορές και κλιμακώσεις μεταξύ πελατών και freelancers.

2. **Πελάτης (Client)**
    - Δημοσιεύει νέα έργα που χρειάζεται να ολοκληρωθούν.
    - Εξετάζει τις αιτήσεις των freelancers και προσλαμβάνει τον κατάλληλο.
    - Παρακολουθεί την εξέλιξη του έργου.

3. **Freelancer (Ελεύθερος Επαγγελματίας)**
    - Περιηγείται στα διαθέσιμα έργα.
    - Υποβάλλει αίτηση για έργα που τον ενδιαφέρουν.
    - Επικοινωνεί με τους πελάτες για την εκτέλεση του έργου.

## 🛠️ Τεχνολογίες που χρησιμοποιούνται
- **Backend**: Spring Boot 3.4.1 (Spring MVC, Spring Security, Spring Data JPA)
- **Γλώσσα Προγραμματισμού**: Java 21
- **Dependency Management**: Maven
- **Βάση Δεδομένων**: PostgreSQL
- **Database Management Tool**: pgAdmin 4
- **API Testing**: Postman

## 🚀 Οδηγίες Εγκατάστασης και Εκτέλεσης

### 1. Προαπαιτούμενα
Πριν ξεκινήσετε, βεβαιωθείτε ότι έχετε εγκαταστήσει τα παρακάτω:
- **Java 21**: Μπορείτε να κατεβάσετε και να εγκαταστήσετε την τελευταία έκδοση της Java [εδώ](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html).
- **Maven**: Βεβαιωθείτε ότι έχετε εγκαταστήσει το Maven για τη διαχείριση των εξαρτήσεων του project. Οδηγίες εγκατάστασης μπορείτε να βρείτε [εδώ](https://maven.apache.org/install.html).
- **PostgreSQL**: Για τη βάση δεδομένων. Μπορείτε να το κατεβάσετε και να το εγκαταστήσετε [εδώ](https://www.postgresql.org/download/).
- **pgAdmin 4**: Διαχείριση της PostgreSQL. Μπορείτε να το κατεβάσετε [εδώ](https://www.pgadmin.org/download/).

### 2. Κλωνοποίηση του Αποθετηρίου
Αρχικά, κλωνοποιήστε το αποθετήριο στον τοπικό σας υπολογιστή:
```bash
git clone https://github.com/naasssssty/Freelance.git
```

## 🔧 Jenkins CI/CD Pipeline

### Σημαντικό: Εκκίνηση kubectl proxy
**Πριν τρέξετε οποιοδήποτε Jenkins pipeline, πρέπει να εκκινήσετε το kubectl proxy:**

```bash
# Εκκίνηση kubectl proxy για Jenkins integration
./scripts/start-kubectl-proxy.sh

# Ή χειροκίνητα:
nohup kubectl proxy --port=8080 --address='0.0.0.0' --accept-hosts='^.*' > kubectl-proxy.log 2>&1 &
```

### Γιατί χρειάζεται το kubectl proxy;
- Το Jenkins container δεν έχει άμεση πρόσβαση στο Kubernetes cluster
- Το kubectl proxy δημιουργεί ένα HTTP endpoint στο `http://172.17.0.1:8080`
- Αυτό επιτρέπει στο Jenkins να επικοινωνεί με το Kubernetes API

### Jenkins Setup

#### Option 1: Standard Docker Setup (Current)
```bash
# 1. Εκκίνηση kubectl proxy (ΑΠΑΡΑΙΤΗΤΟ)
./scripts/start-kubectl-proxy.sh

# 2. Εκκίνηση Jenkins
cd docker
docker-compose -f docker-compose-jenkins.yml up -d

# Το Jenkins θα εντοπίσει αυτόματα το Docker gateway IP
```

#### Option 2: Host Network Mode (Alternative)
Αν θέλετε να τρέξετε το Jenkins με άμεση πρόσβαση στο host network:

```bash
# Σταμάτημα υπάρχοντος Jenkins container
docker stop jenkins

# Εκτέλεση Jenkins με host network
docker run -d \
  --name jenkins \
  --network host \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# Με host network, μπορείτε να χρησιμοποιήσετε localhost απευθείας
# Ενημερώστε το kubeconfig να χρησιμοποιεί: http://localhost:8080
```

### Cross-Machine Deployment

Για deployment σε διαφορετικές μηχανές:

1. **Βεβαιωθείτε ότι kubectl proxy τρέχει** σε κάθε target μηχανή:
   ```bash
   kubectl proxy --port=8080 --address=0.0.0.0 --accept-hosts='^.*' &
   ```

2. **Το pipeline εντοπίζει αυτόματα** το Docker gateway IP σε κάθε μηχανή

3. **Εναλλακτικά**: Χρησιμοποιήστε service discovery ή environment variables για να ρυθμίσετε το Kubernetes endpoint

### Environment Variable Configuration

Μπορείτε να παρακάμψετε το Kubernetes server URL ορίζοντας τη μεταβλητή περιβάλλοντος `KUBE_SERVER_URL` στο Jenkins:

```bash
# Στο Jenkins System Configuration > Global Properties > Environment Variables
KUBE_SERVER_URL=http://localhost:8080        # Για host network mode
KUBE_SERVER_URL=http://192.168.1.100:8080    # Για συγκεκριμένη IP μηχανής
KUBE_SERVER_URL=https://k8s.example.com:6443 # Για εξωτερικό cluster
```

**Σειρά Προτεραιότητας:**
1. `KUBE_SERVER_URL` environment variable (αν οριστεί)
2. Αυτόματα εντοπισμένο Docker gateway IP (fallback)

### Troubleshooting

#### Αν το deployment αποτυγχάνει με "Connection refused":
1. Ελέγξτε αν το kubectl proxy τρέχει:
   ```bash
   ps aux | grep "kubectl proxy"
   ```

2. Εκκινήστε το kubectl proxy αν δεν τρέχει:
   ```bash
   ./scripts/start-kubectl-proxy.sh
   ```

3. Ελέγξτε τη σύνδεση:
   ```bash
   curl http://localhost:8080/api/v1/namespaces
   ```

#### Αν το Minikube δεν τρέχει:
```bash
minikube status
minikube start  # αν δεν τρέχει
```

## Kubernetes Access Methods

| Method | Pros | Cons | Use Case |
|--------|------|------|----------|
| kubectl proxy + Docker gateway | Portable across machines | Requires proxy process | CI/CD pipelines |
| Host network mode | Direct localhost access | Less container isolation | Development |
| External LoadBalancer | Production-ready | Complex setup | Production clusters |
