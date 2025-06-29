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
    ```text
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
7.  Στο **Repository URL**, εισάγετε το URL του Git repository σας (`https://github.com/naasssssty/Freelance`).
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