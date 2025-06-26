# Τεκμηρίωση Docker

Αυτός ο φάκελος περιέχει όλα τα απαραίτητα αρχεία για την containerization της εφαρμογής μας με τη χρήση του Docker. Η διαδικασία αυτή μας επιτρέπει να "πακετάρουμε" το backend και το frontend σε απομονωμένα, φορητά περιβάλλοντα (containers), διασφαλίζοντας ότι θα τρέχουν με τον ίδιο τρόπο παντού.

---

## 🏛️ Αρχιτεκτονική Docker

Το παρακάτω διάγραμμα δείχνει πώς τα `Dockerfile` χρησιμοποιούνται για να δημιουργήσουν τις Docker images για κάθε υπηρεσία και πώς το `docker-compose` τις ενορχηστρώνει για να δημιουργήσει ένα πλήρες, δικτυωμένο περιβάλλον εφαρμογής.

```mermaid
graph TD
    subgraph "Διαδικασία Build (docker-compose build)"
        Dockerfile_Backend["Dockerfile.backend<br/>(Spring Boot Πηγαίος Κώδικας)"] -- "Χτίζει" --> Backend_Image("Backend Docker Image");
        Dockerfile_Frontend["Dockerfile.frontend<br/>(React Πηγαίος Κώδικας)"] -- "Χτίζει" --> Frontend_Image("Frontend Docker Image");
    end

    subgraph "Περιβάλλον Εκτέλεσης (docker-compose up)"
        
        subgraph "Docker Network"
            Frontend_Container["Frontend Container<br/>(Nginx + React build)"];
            Backend_Container["Backend Container<br/>(Java App)"];
            Postgres_Container["PostgreSQL Container"];
            MinIO_Container["MinIO Container"];
            MailHog_Container["MailHog Container"];

            Frontend_Container -- "API Requests (Port 8080)" --> Backend_Container;
            Backend_Container -- "DB Connection" --> Postgres_Container;
            Backend_Container -- "File Storage" --> MinIO_Container;
            Backend_Container -- "Email" --> MailHog_Container;
        end

        User("Χρήστης / Browser") -- "HTTP Request (Port 3000)" --> Frontend_Container;
    end
    
    Backend_Image -- "Δημιουργεί" --> Backend_Container;
    Frontend_Image -- "Δημιουργεί" --> Frontend_Container;

    %% Styling
    style Dockerfile_Backend fill:#f5f5f5,stroke:#333
    style Dockerfile_Frontend fill:#f5f5f5,stroke:#333
    style Backend_Image fill:#0db7ed,stroke:#333,color:white
    style Frontend_Image fill:#0db7ed,stroke:#333,color:white

    style Frontend_Container fill:#61DAFB,stroke:#333
    style Backend_Container fill:#6DB33F,stroke:#333
    style Postgres_Container fill:#336791,stroke:#333,color:white
    style MinIO_Container fill:#c72c41,stroke:#333,color:white
    style MailHog_Container fill:#80a480,stroke:#333,color:white
```

---

## 📜 Περιγραφή Αρχείων

*   **`Dockerfile.backend`**:
    Αυτό το αρχείο περιέχει τις οδηγίες για τη δημιουργία του Docker image της Spring Boot εφαρμογής. Χρησιμοποιεί μια προσέγγιση multi-stage build:
    1.  **Build Stage**: Χρησιμοποιεί ένα image του Maven για να κάνει compile τον Java κώδικα και να δημιουργήσει το εκτελέσιμο `.jar` αρχείο.
    2.  **Run Stage**: Αντιγράφει μόνο το `.jar` αρχείο σε ένα ελαφρύ image του OpenJDK. Αυτό έχει ως αποτέλεσμα ένα μικρότερο και πιο ασφαλές τελικό image.

*   **`Dockerfile.frontend`**:
    Αυτό το αρχείο δημιουργεί το Docker image για την React εφαρμογή. Ακολουθεί επίσης πρακτική multi-stage build:
    1.  **Build Stage**: Χρησιμοποιεί ένα image του Node.js για να εγκαταστήσει τις εξαρτήσεις (`npm install`) και να δημιουργήσει τα στατικά αρχεία της εφαρμογής (`npm run build`).
    2.  **Run Stage**: Αντιγράφει τα στατικά αρχεία που δημιουργήθηκαν σε έναν ελαφρύ Nginx server, ο οποίος είναι βελτιστοποιημένος για το σερβίρισμα στατικού περιεχομένου.

*   **`docker-compose.yml`**:
    Αυτό είναι το κεντρικό αρχείο ενορχήστρωσης. Ορίζει όλες τις υπηρεσίες που αποτελούν την εφαρμογή μας (backend, frontend, database, minio, mailhog), πώς συνδέονται μεταξύ τους (δίκτυο) και ποια ports εκθέτουν στον host υπολογιστή. Είναι ιδανικό για να σηκώσουμε ολόκληρο το περιβάλλον για τοπική ανάπτυξη και testing με μία μόνο εντολή.

*   **`docker-compose-jenkins.yml`**:
    Ένα εξειδικευμένο αρχείο compose που χρησιμοποιείται αποκλειστικά για να τρέξει την υπηρεσία του Jenkins, απομονώνοντάς την από την κύρια εφαρμογή.

---

## 🚀 Οδηγίες Χρήσης (Docker Compose)

Για να διαχειριστείτε ολόκληρο το περιβάλλον της εφαρμογής, χρησιμοποιήστε τις παρακάτω εντολές από τον φάκελο `docker/`.

*   **Εκκίνηση του περιβάλλοντος:**
    Αυτή η εντολή θα κάνει build τις images (αν δεν υπάρχουν ήδη) και θα ξεκινήσει όλα τα containers.
    ```bash
    docker-compose up -d
    ```
    Το `-d` (detached mode) τα τρέχει στο background.

*   **Παρακολούθηση των logs:**
    Για να δείτε τα logs από όλα τα containers σε πραγματικό χρόνο:
    ```bash
    docker-compose logs -f
    ```

*   **Σταμάτημα του περιβάλλοντος:**
    Αυτή η εντολή σταματά και αφαιρεί τα containers και το δίκτυο που δημιουργήθηκαν.
    ```bash
    docker-compose down
    ``` 