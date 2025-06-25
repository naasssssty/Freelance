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

# Jenkins CI/CD Pipeline

## Jenkins Setup

### Option 1: Standard Docker Setup (Current)
```bash
# Start kubectl proxy (required for container access)
kubectl proxy --port=8080 --address=0.0.0.0 --accept-hosts='^.*' &

# Jenkins will auto-detect Docker gateway IP
```

### Option 2: Host Network Mode (Alternative)
If you want to run Jenkins with direct host network access:

```bash
# Stop existing Jenkins container
docker stop jenkins

# Run Jenkins with host network
docker run -d \
  --name jenkins \
  --network host \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# With host network, you can use localhost directly
# Update kubeconfig to use: http://localhost:8080
```

### Cross-Machine Deployment

For deploying across different machines:

1. **Ensure kubectl proxy is running** on each target machine:
   ```bash
   kubectl proxy --port=8080 --address=0.0.0.0 --accept-hosts='^.*' &
   ```

2. **The pipeline automatically detects** the Docker gateway IP on each machine

3. **Alternative**: Use a service discovery mechanism or environment variables to configure the Kubernetes endpoint

### Environment Variable Configuration

You can override the Kubernetes server URL by setting the `KUBE_SERVER_URL` environment variable in Jenkins:

```bash
# In Jenkins System Configuration > Global Properties > Environment Variables
KUBE_SERVER_URL=http://localhost:8080        # For host network mode
KUBE_SERVER_URL=http://192.168.1.100:8080    # For specific machine IP
KUBE_SERVER_URL=https://k8s.example.com:6443 # For external cluster
```

**Priority Order:**
1. `KUBE_SERVER_URL` environment variable (if set)
2. Auto-detected Docker gateway IP (fallback)

## Kubernetes Access Methods

| Method | Pros | Cons | Use Case |
|--------|------|------|----------|
| kubectl proxy + Docker gateway | Portable across machines | Requires proxy process | CI/CD pipelines |
| Host network mode | Direct localhost access | Less container isolation | Development |
| External LoadBalancer | Production-ready | Complex setup | Production clusters |
