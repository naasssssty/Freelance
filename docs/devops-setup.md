# DevOps & CI/CD Pipeline - ErgoHub

## 1. Εισαγωγή

Το παρόν έγγραφο περιγράφει τη μεθοδολογία και τα εργαλεία DevOps που υιοθετήθηκαν για την αυτοματοποίηση της ανάπτυξης, του ελέγχου και της παράδοσης (CI/CD) της εφαρμογής **ErgoHub**. Στόχος είναι η δημιουργία μιας αξιόπιστης και επαναλαμβανόμενης διαδικασίας που μειώνει τον χρόνο από τη συγγραφή του κώδικα έως την παραγωγική λειτουργία.

**Ομάδα Ανάπτυξης:**
*   **Ομάδα 49**
    *   Κωνσταντίνος Παπαδόγιαννης
    *   Anastasiia Zervas

---

## 2. Εργαλεία DevOps (Toolchain)

Η αλυσίδα εργαλείων (toolchain) που υποστηρίζει τη ροή DevOps του project αποτελείται από τα παρακάτω:

| Κατηγορία                 | Εργαλείο                                       | Ρόλος & Σκοπός                                                                                     |
| ------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Version Control System**| GitHub                                         | Κεντρικό αποθετήριο για τον πηγαίο κώδικα (Backend & Frontend) και τα αρχεία παραμετροποίησης (IaC). |
| **CI/CD Server**          | Jenkins                                        | Ενορχηστρωτής της CI/CD pipeline. Αυτοματοποιεί τα βήματα build, test, containerize και deploy.     |
| **Containerization**      | Docker                                         | Δημιουργία ελαφρών, μετανοσμών & απομονωμένων containers για το κάθε service (frontend, backend). |
| **Build Tools**           | Apache Maven (Backend) <br/> NPM (Frontend)    | Διαχείριση εξαρτήσεων, εκτέλεση ελέγχων (tests) και δημιουργία των εκτελέσιμων artifacts.         |
| **Configuration Mgmt**    | Ansible                                        | Αυτοματοποίηση του deployment στο Kubernetes. Εκτελεί playbooks για την εφαρμογή των αλλαγών.      |
| **Container Orchestration**| Kubernetes (AKS)                               | Διαχείριση του жизненного κύκλου των containers στην παραγωγή (scaling, high availability, networking).   |
| **Cloud Provider**        | Microsoft Azure                                | Παροχή της υποκείμενης υποδομής (managed Kubernetes cluster, networking, storage).                 |

---

## 3. Ροή CI/CD (Pipeline Flow)

Η διαδικασία Continuous Integration και Continuous Deployment (CI/CD) είναι πλήρως αυτοματοποιημένη και ενεργοποιείται με κάθε `push` στον `main` κλάδο του αποθετηρίου στο GitHub. Η παρακάτω ροή περιγράφει τα βήματα από την οπτική του Backend (η ροή του Frontend είναι ανάλογη).

```mermaid
graph TD
    subgraph "Phase 1: Development & Version Control"
        A(Developer) -- "1. git push" --> B(GitHub Repository)
    end

    subgraph "Phase 2: Continuous Integration (Jenkins)"
        direction LR
        B -- "2. Webhook Trigger" --> C{Jenkins Server}
        C -- "3. Start Pipeline" --> D[Stage: Checkout]
        D -- "4. Source Code" --> E[Stage: Build & Test <br/> mvn clean install]
        E -- "5. Build Artifacts" --> F[Stage: Build Docker Image <br/> docker build]
        F -- "6. Docker Image" --> G[Stage: Push to Registry <br/> docker push]
    end

    subgraph "Phase 3: Continuous Deployment (Ansible & Kubernetes)"
        direction LR
        G -- "7. Image Ready" --> C
        C -- "8. Trigger Deployment" --> H{Ansible <br/> (via Jenkins plugin)}
        H -- "9. Run Playbook <br/> deploy-k8s-full.yml" --> I(Kubernetes Cluster - AKS)
        I -- "10. Pull New Image" --> J(Docker Registry)
        I -- "11. Rolling Update" --> K(Update Pods <br/> Backend Service)
    end

    subgraph "Phase 4: Live Application"
       K -- "Ενημερωμένη Υπηρεσία" --> L(User Access <br/> ergohub.duckdns.org)
    end

    classDef dev fill:#66c2a5,stroke:#333,stroke-width:1px;
    class A,B dev;
    classDef ci fill:#fc8d62,stroke:#333,stroke-width:1px;
    class C,D,E,F,G,J ci;
    classDef cd fill:#8da0cb,stroke:#333,stroke-width:1px;
    class H,I,K cd;
    classDef live fill:#e78ac3,stroke:#333,stroke-width:1px;
    class L live;
```

### Αναλυτικά Βήματα:

1.  **Code Push**: Ο προγραμματιστής ολοκληρώνει μια λειτουργία και στέλνει τον κώδικα στο `main` branch του **GitHub**.
2.  **Webhook Trigger**: Το GitHub ειδοποιεί αυτόματα τον **Jenkins server** για την αλλαγή μέσω ενός webhook.
3.  **Pipeline Start**: Ο Jenkins ενεργοποιεί το αντίστοιχο pipeline (`Jenkinsfile-backend` ή `Jenkinsfile-frontend`).
4.  **Checkout**: Το pipeline αρχικά "κατεβάζει" τον τελευταίο πηγαίο κώδικα από το GitHub.
5.  **Build & Test**:
    *   **Backend**: Ο Jenkins εκτελεί την εντολή `mvn clean install` για να μεταγλωττίσει τον Java κώδικα, να εκτελέσει τα unit tests (JUnit) και να δημιουργήσει το `.jar` αρχείο.
    *   **Frontend**: Εκτελεί `npm install` και `npm test` για τις εξαρτήσεις και τα tests του React app.
6.  **Build Docker Image**: Εάν το προηγούμενο βήμα είναι επιτυχές, ο Jenkins χρησιμοποιεί το αντίστοιχο `Dockerfile` για να δημιουργήσει μια νέα Docker image που περιέχει την εφαρμογή. Η εικόνα λαμβάνει ένα μοναδικό tag, συνήθως το hash του commit.
7.  **Push to Docker Registry**: Η νέα Docker image ανεβαίνει σε ένα κεντρικό Docker Registry, καθιστώντας την διαθέσιμη στο Kubernetes cluster.
8.  **Trigger Deployment**: Μετά την επιτυχή ώθηση της εικόνας, ο Jenkins καλεί το **Ansible**.
9.  **Run Ansible Playbook**: Ο Jenkins δίνει εντολή στο Ansible να εκτελέσει το playbook `ansible/deploy-k8s-full.yml`. Αυτό το playbook περιέχει τις οδηγίες για το deployment.
10. **Apply Manifests**: Το Ansible συνδέεται με το **Azure Kubernetes Service (AKS)** cluster και εφαρμόζει τα αρχεία YAML που βρίσκονται στον φάκελο `kubernetes/`. Ενημερώνει το `Deployment` του αντίστοιχου service (π.χ., `backend-deployment.yml`) με το tag της νέας Docker image.
11. **Rolling Update**: Το Kubernetes αναλαμβάνει από εδώ και πέρα. Ξεκινά μια διαδικασία **rolling update**: δημιουργεί νέα Pods με τη νέα έκδοση της εφαρμογής και, μόνο όταν αυτά είναι έτοιμα και υγιή, τερματίζει τα παλιά. Αυτό διασφαλίζει **μηδενικό χρόνο μη διαθεσιμότητας (zero downtime)** κατά τις αναβαθμίσεις.

---

## 4. Infrastructure as Code (IaC)

Η φιλοσοφία του Infrastructure as Code (IaC) εφαρμόζεται σε όλο το project για να διασφαλιστεί η συνέπεια, η επαναληψιμότητα και η εκδοχή της υποδομής.

*   **Kubernetes Manifests (`/kubernetes`)**: Όλοι οι πόροι του Kubernetes (Deployments, Services, Ingress, ConfigMaps, Secrets) ορίζονται σε αρχεία YAML. Αυτό επιτρέπει τη διαχείριση της αρχιτεκτονικής της εφαρμογής εντός του cluster ως κώδικα.
*   **Ansible Playbooks (`/ansible`)**: Τα playbooks ορίζουν τις διαδικασίες για την παραμετροποίηση και το deployment. Αντί για χειροκίνητες ενέργειες, χρησιμοποιούμε κώδικα Ansible για να εφαρμόσουμε τις αλλαγές στο cluster με προβλέψιμο τρόπο.
*   **Dockerfiles (`/docker`)**: Ο ορισμός του περιβάλλοντος εκτέλεσης κάθε service (frontend/backend) γίνεται μέσα από ένα `Dockerfile`, διασφαλίζοντας ότι η εφαρμογή τρέχει πάντα στο ίδιο περιβάλλον, από το μηχάνημα του developer μέχρι την παραγωγή.
