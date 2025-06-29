# Οδηγός Εγκατάστασης & Παραμετροποίησης Jenkins - ErgoHub

## 1. Εισαγωγή

Το παρόν έγγραφο αποτελεί έναν πλήρη οδηγό για την εγκατάσταση, παραμετροποίηση και χρήση του **Jenkins** ως CI/CD server για το project **ErgoHub**. Ο Jenkins αναλαμβάνει την αυτοματοποίηση της διαδικασίας build, test και deployment για το frontend και το backend της εφαρμογής.

**Ομάδα Ανάπτυξης:**
*   **Ομάδα 49**
    *   Κωνσταντίνος Παπαδόγιαννης
    *   Anastasiia Zervas

---

## 2. Προαπαιτούμενα

Πριν ξεκινήσετε, βεβαιωθείτε ότι στο σύστημά σας είναι εγκατεστημένα τα παρακάτω εργαλεία:
*   **Docker**: Για την εκτέλεση του Jenkins container.
*   **Docker Compose**: Για την εύκολη διαχείριση του Jenkins service.
*   **Git**: Για την ανάκτηση του πηγαίου κώδικα από το αποθετήριο.
*   Ένα αρχείο `kubeconfig` με πρόσβαση στο Kubernetes cluster σας.

---

## 3. Εκκίνηση Jenkins μέσω Docker

Η πιο εύκολη μέθοδος για να ξεκινήσετε τον Jenkins είναι μέσω του προ-παραμετροποιημένου αρχείου `docker-compose-jenkins.yml` που παρέχεται στο project.

1.  Ανοίξτε ένα terminal στη ρίζα του project.
2.  Εκτελέστε την παρακάτω εντολή για να ξεκινήσετε τον Jenkins container σε background mode:
    ```bash
    docker-compose -f docker/docker-compose-jenkins.yml up -d
    ```
3.  **Πρόσβαση στο Jenkins UI**: Ανοίξτε έναν browser και πλοηγηθείτε στη διεύθυνση `http://localhost:8080`.
4.  **Initial Admin Password**: Για την πρώτη σας είσοδο, ο Jenkins θα ζητήσει ένα αρχικό password. Μπορείτε να το βρείτε εκτελώντας την εντολή:
    ```bash
    docker logs jenkins
    ```
    Αναζητήστε στο output ένα μήνυμα παρόμοιο με το παρακάτω και αντιγράψτε τον κωδικό:
    ```
    *************************************************************
    
    Jenkins initial setup is required. An admin user has been created and a password generated.
    Please use the following password to proceed to installation:
    
    [YOUR_INITIAL_ADMIN_PASSWORD]
    
    *************************************************************
    ```
5.  Ακολουθήστε τις οδηγίες στην οθόνη, επιλέγοντας **"Install suggested plugins"** και δημιουργώντας τον δικό σας λογαριασμό διαχειριστή.

---

## 4. Απαραίτητα Plugins

Τα pipelines του project απαιτούν συγκεκριμένα plugins για να λειτουργήσουν. Πλοηγηθείτε στο **Manage Jenkins > Plugins > Available plugins** και εγκαταστήστε τα παρακάτω:

*   **Ansible plugin**: Για την εκτέλεση Ansible playbooks από τα Jenkins pipelines.
*   **Docker Pipeline**: Για την ενσωμάτωση εντολών Docker (`docker.build`, `docker.push`) μέσα στα pipelines.
*   **Blue Ocean**: (Προαιρετικό αλλά συνιστάται) Παρέχει ένα μοντέρνο και οπτικά ελκυστικό UI για την παρακολούθηση των pipelines.

---

## 5. Παραμετροποίηση Credentials

Τα pipelines χρειάζονται ασφαλή πρόσβαση σε εξωτερικές υπηρεσίες. Αυτό επιτυγχάνεται μέσω των Credentials του Jenkins. Πλοηγηθείτε στο **Manage Jenkins > Credentials > System > Global credentials (unrestricted)** και προσθέστε τα παρακάτω:

| Credential ID (Name) | Type                 | Περιγραφή                                                                                                   |
| -------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `dockerhub_credentials`  | Username with password | Τα credentials σας για το Docker Hub (ή άλλο Docker Registry), ώστε ο Jenkins να μπορεί να ανεβάζει τις εικόνες. |
| `kubeconfig`         | Secret file          | Ανεβάστε το αρχείο `kubeconfig` που σας δίνει πρόσβαση στο Kubernetes cluster.                                |
| `github-credentials` | Username with password ή SSH | Τα credentials σας για το GitHub, ώστε ο Jenkins να μπορεί να κάνει checkout τον κώδικα. (Αν το repo είναι private) |

---

## 6. Δημιουργία των Pipelines

Τώρα θα δημιουργήσουμε τα δύο jobs, ένα για το backend και ένα για το frontend.

1.  Από το κεντρικό dashboard, επιλέξτε **"New Item"**.
2.  Εισάγετε ένα όνομα για το pipeline (π.χ., `ergohub-backend`).
3.  Επιλέξτε **"Pipeline"** ως τύπο και πατήστε **"OK"**.
4.  Στη σελίδα παραμετροποίησης του pipeline, πηγαίνετε στην ενότητα **"Pipeline"**.
5.  Στο πεδίο **Definition**, επιλέξτε **"Pipeline script from SCM"**.
6.  Στο **SCM**, επιλέξτε **"Git"**.
7.  Στο **Repository URL**, εισάγετε το URL του Git repository σας (π.χ., `https://github.com/kpapadog/FreelancerProject.git`).
8.  Αν το αποθετήριο είναι private, επιλέξτε το κατάλληλο credential από τη λίστα **Credentials**.
9.  Στο **Branch Specifier**, βεβαιωθείτε ότι είναι `*/main` (ή ο κλάδος που χρησιμοποιείτε).
10. Στο **Script Path**, εισάγετε τη διαδρομή προς το Jenkinsfile.

    *   Για το backend pipeline: `jenkins/Jenkinsfile-backend`
    *   Για το frontend pipeline: `jenkins/Jenkinsfile-frontend`

11. Πατήστε **"Save"**.

Επαναλάβετε την ίδια διαδικασία για να δημιουργήσετε και το δεύτερο pipeline (π.χ., `ergohub-frontend`), αλλάζοντας το όνομα και το Script Path.

## 7. Ενεργοποίηση (Triggering)

*   **Αυτόματη**: Εάν έχετε ρυθμίσει webhooks στο GitHub repository σας που να δείχνουν στον Jenkins server, κάθε `git push` στον `main` κλάδο θα ενεργοποιεί αυτόματα το αντίστοιχο pipeline.
*   **Χειροκίνητη**: Μπορείτε να ενεργοποιήσετε οποιοδήποτε pipeline χειροκίνητα, πηγαίνοντας στη σελίδα του pipeline και πατώντας **"Build Now"**.

## 🚀 Βήματα Ρύθμισης Jenkins

### 1. Εγκατάσταση Jenkins Plugins

Μεταβείτε στο **Manage Jenkins > Manage Plugins** και εγκαταστήστε τα παρακάτω plugins:

#### Απαραίτητα Plugins:
- **Git Plugin** - για Git integration
- **Pipeline Plugin** - για Pipeline support
- **NodeJS Plugin** - για Node.js support
- **HTML Publisher Plugin** - για coverage reports
- **JUnit Plugin** - για test results
- **Workspace Cleanup Plugin** - για workspace cleanup

#### Προαιρετικά Plugins:
- **Blue Ocean** - για καλύτερο UI
- **Email Extension Plugin** - για notifications
- **Docker Pipeline Plugin** - για Docker support (αν χρειάζεται)

### 2. Ρύθμιση Node.js

1. Μεταβείτε στο **Manage Jenkins > Global Tool Configuration**
2. Στην ενότητα **NodeJS**, κάντε κλικ στο **Add NodeJS**
3. Ρυθμίστε:
   - **Name**: `NodeJS` (ή όπως αναφέρεται στο Jenkinsfile)
   - **Version**: Επιλέξτε την τελευταία LTS έκδοση (π.χ. Node.js 18.x ή 20.x)
   - **Global npm packages to install**: `npm@latest`

### 3. Δημιουργία Pipeline Job

1. Κάντε κλικ στο **New Item**
2. Επιλέξτε **Pipeline** και δώστε όνομα (π.χ. `Freelance-Frontend`)
3. Στη σελίδα configuration:

#### Pipeline Configuration:
- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: `https://github.com/naasssssty/Freelance.git`
- **Branch Specifier**: `*/main` ή `*/test-branch`
- **Script Path**: `jenkins/Jenkinsfile-frontend`

### 4. Ρύθμιση Credentials (Προαιρετικό)

Αν χρειάζεστε Docker Hub integration:

1. Μεταβείτε στο **Manage Jenkins > Manage Credentials**
2. Κάντε κλικ στο **Global** και μετά **Add Credentials**
3. Επιλέξτε **Username with password**
4. Ρυθμίστε:
   - **ID**: `docker-hub-credentials`
   - **Username**: Το Docker Hub username σας
   - **Password**: Το Docker Hub password σας

### 5. Εκτέλεση Pipeline

1. Μεταβείτε στο job που δημιουργήσατε
2. Κάντε κλικ στο **Build Now**
3. Παρακολουθήστε την πρόοδο στο **Console Output**

## 🔧 Troubleshooting

### Συνήθη Προβλήματα:

#### 1. "Jenkins doesn't have label 'docker-agent'"
**Λύση**: Χρησιμοποιήστε το `Jenkinsfile-frontend-simple` που χρησιμοποιεί `agent any`

#### 2. "Node.js not found"
**Λύση**: 
- Εγκαταστήστε το NodeJS plugin
- Ρυθμίστε το NodeJS στο Global Tool Configuration
- Προσθέστε `tools { nodejs 'NodeJS' }` στο Jenkinsfile

#### 3. "npm not found"
**Λύση**:
- Βεβαιωθείτε ότι το NodeJS plugin είναι εγκατεστημένο
- Ελέγξτε ότι το Node.js είναι σωστά ρυθμισμένο

#### 4. "Tests failed"
**Λύση**:
- Ελέγξτε τα test logs στο Console Output
- Βεβαιωθείτε ότι όλες οι dependencies είναι εγκατεστημένες
- Τρέξτε τα tests τοπικά πρώτα

#### 5. "Docker access failed"
**Λύση**:
- Χρησιμοποιήστε το `Jenkinsfile-frontend-simple` που δεν απαιτεί Docker
- Ή ρυθμίστε το Docker access για τον Jenkins user

### Χρήσιμες Εντολές για Debugging:

```bash
# Έλεγχος Node.js version
node --version

# Έλεγχος npm version
npm --version

# Τοπική εκτέλεση tests
cd frontend
npm install
npm test

# Τοπικό build
npm run build
```

## 📊 Pipeline Stages Επεξήγηση

### 1. **Checkout**
- Καθαρίζει το workspace
- Κάνει checkout τον κώδικα από το Git repository

### 2. **Setup Node.js**
- Ελέγχει αν το Node.js είναι διαθέσιμο
- Εμφανίζει τις εκδόσεις Node.js και npm

### 3. **Install Dependencies**
- Εκτελεί `npm install` για εγκατάσταση dependencies

### 4. **Lint Code**
- Εκτελεί ESLint για έλεγχο code quality
- Αν αποτύχει, το build γίνεται UNSTABLE (όχι FAILED)

### 5. **Run Tests**
- Εκτελεί unit tests με Jest
- Δημοσιεύει test results και coverage reports
- Αν αποτύχει, το build γίνεται FAILED

### 6. **Build Application**
- Εκτελεί `npm run build` για production build
- Αρχειοθετεί τα build artifacts

### 7. **Security Audit**
- Εκτελεί `npm audit` για security vulnerabilities
- Αν βρει προβλήματα, το build γίνεται UNSTABLE

## 📈 Monitoring & Reports

Μετά την επιτυχή εκτέλεση, θα έχετε διαθέσιμα:

- **Test Results**: JUnit format reports
- **Coverage Report**: HTML coverage report
- **Build Artifacts**: Τα built files του React app
- **Console Output**: Detailed logs για debugging

## 🔄 Συνεχής Ενημέρωση

Για αυτόματη εκτέλεση του pipeline:

1. **Poll SCM**: Ρυθμίστε polling για αλλαγές στο Git
2. **Webhooks**: Ρυθμίστε GitHub webhooks για instant triggers
3. **Scheduled Builds**: Ρυθμίστε cron jobs για τακτική εκτέλεση

### Παράδειγμα Poll SCM Configuration:
```
# Κάθε 5 λεπτά
H/5 * * * *

# Κάθε ώρα
H * * * *

# Καθημερινά στις 2:00 AM
H 2 * * *
``` 