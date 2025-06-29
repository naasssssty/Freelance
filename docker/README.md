# 🐳 Docker Configuration - FreelancerProject

> **Ομάδα 49** | Containerization | DIT250 - DevOps

Αυτός ο φάκελος περιέχει όλα τα απαραίτητα αρχεία για το containerization της εφαρμογής μας με το **Docker**. Η χρήση containers μας επιτρέπει να "πακετάρουμε" κάθε υπηρεσία (backend, frontend, database) μαζί με τις εξαρτήσεις της σε ένα απομονωμένο, φορητό και προβλέψιμο περιβάλλον.

## 🏛️ 1. Αρχιτεκτονική Docker

Για την τοπική ανάπτυξη και τις δοκιμές, χρησιμοποιούμε το **Docker Compose** για να ορίσουμε και να εκτελέσουμε την πολυ-container εφαρμογή μας. Η αρχιτεκτονική που στήνεται είναι η παρακάτω:

```mermaid
graph TD
    subgraph "Host Machine"
        subgraph "Docker Network: freelance-net"
            style freelance-net fill:#f0f8ff,stroke:#84a9c0,stroke-width:2px

            FRONTEND[Frontend (React + Nginx)]
            BACKEND[Backend (Spring Boot)]
            DB[Database (PostgreSQL)]
            MINIO[Object Storage (MinIO)]
            MAIL[Mail Catcher (MailHog)]
        end
        
        USER[Developer's Browser] -- "HTTP/S on localhost:80" --> FRONTEND
        FRONTEND -- "Serves static files" --> USER
        FRONTEND -- "API Calls to /api" --> BACKEND
        BACKEND -- "Reads/Writes Data" --> DB
        BACKEND -- "File Upload/Download" --> MINIO
        BACKEND -- "Sends Emails" --> MAIL
    end

    MINIO_UI[MinIO UI]
    MAIL_UI[MailHog UI]
    
    USER -- "localhost:9001 (MinIO UI)" --> MINIO_UI
    USER -- "localhost:8025 (MailHog UI)" --> MAIL_UI

    style FRONTEND fill:#add8e6
    style BACKEND fill:#f0e68c
    style DB fill:#d3d3d3
    style MINIO fill:#ffb6c1
    style MAIL fill:#98fb98
```
Το `docker-compose.yml` ορίζει όλες τις παραπάνω υπηρεσίες, τα ports που εκθέτουν, τους δίσκους (volumes) για μόνιμη αποθήκευση δεδομένων και το δίκτυο `freelance-net` για την μεταξύ τους επικοινωνία.

## 📄 2. Ανάλυση Αρχείων

### `Dockerfile.backend`
Αυτό το `Dockerfile` χτίζει το image για την Spring Boot εφαρμογή μας.
-   Χρησιμοποιεί ως base image ένα επίσημο image που περιέχει το **Java 21 (Eclipse Temurin)**.
-   Αντιγράφει το εκτελέσιμο `.jar` αρχείο, το οποίο έχει παραχθεί από το Maven build (`mvn package`), μέσα στο container.
-   Ορίζει την εντολή `java -jar app.jar` για την εκκίνηση του server.

### `Dockerfile.frontend`
Αυτό το `Dockerfile` χρησιμοποιεί μια multi-stage build στρατηγική για να δημιουργήσει ένα βελτιστοποιημένο image για το React frontend.
-   **Stage 1: Build**:
    -   Ξεκινά από ένα `node` image.
    -   Αντιγράφει τα `package.json`, `package-lock.json` και τον κώδικα του frontend.
    -   Εκτελεί `npm install` για να εγκαταστήσει τις εξαρτήσεις.
    -   Εκτελεί `npm run build` για να δημιουργήσει τα στατικά αρχεία (HTML, CSS, JS) στον φάκελο `/build`.
-   **Stage 2: Serve**:
    -   Ξεκινά από ένα ελαφρύ `nginx` image.
    -   Αντιγράφει τα στατικά αρχεία που δημιουργήθηκαν στο Stage 1 μέσα στον φάκελο που σερβίρει ο Nginx.
    -   Αντιγράφει το custom `nginx.conf` για να ρυθμίσει σωστά το proxying των API calls προς το backend.

### `docker-compose.yml`
Το κεντρικό αρχείο ενορχήστρωσης. Ορίζει 5 υπηρεσίες:
1.  **`backend`**: Χτίζει το image από το `Dockerfile.backend`.
2.  **`frontend`**: Χτίζει το image από το `Dockerfile.frontend`. Εκθέτει την πόρτα `80` για πρόσβαση από τον browser.
3.  **`db`**: Χρησιμοποιεί το επίσημο `postgres` image. Ορίζει ένα volume (`postgres_data`) για να μην χάνονται τα δεδομένα της βάσης όταν το container σταματά.
4.  **`minio`**: Χρησιμοποιεί το επίσημο `minio/minio` image. Ορίζει ένα volume (`minio_data`) για την αποθήκευση των αρχείων.
5.  **`mailhog`**: Χρησιμοποιεί το επίσημο `mailhog/mailhog` image, ένα χρήσιμο εργαλείο που "παγιδεύει" τα εξερχόμενα emails για να μπορούμε να τα βλέπουμε κατά την ανάπτυξη.

### `nginx.conf`
Το αρχείο ρυθμίσεων για τον Nginx server που τρέχει μέσα στο frontend container. Ο κύριος ρόλος του είναι να λειτουργεί ως **reverse proxy**.
-   Όταν ο browser ζητά στατικά αρχεία (HTML, CSS, JS, εικόνες), ο Nginx τα σερβίρει απευθείας.
-   Όταν ο browser κάνει một αίτημα σε ένα path που ξεκινά με `/api/`, ο Nginx προωθεί αυτό το αίτημα στο `backend` container στη πόρτα `8080`. Αυτό λύνει τα προβλήματα Cross-Origin Resource Sharing (CORS) και απλοποιεί την αρχιτεκτονική.

## 🚀 3. Εγκατάσταση και Εκτέλεση

Για να "σηκώσετε" ολόκληρη την εφαρμογή τοπικά, αρκεί μία μόνο εντολή από τον ριζικό φάκελο του project.

```bash
# Βεβαιωθείτε ότι το Docker Desktop είναι σε λειτουργία.

# Η παράμετρος -d εκτελεί τα containers στο background.
# Η παράμετρος --build ξαναχτίζει τα images αν έχουν γίνει αλλαγές στα Dockerfiles.
docker-compose -f docker/docker-compose.yml up --build -d
```

Μετά την εκτέλεση:
-   Η εφαρμογή θα είναι διαθέσιμη στο `http://localhost`.
-   Το MailHog UI θα είναι στο `http://localhost:8025`.
-   Το MinIO UI θα είναι στο `http://localhost:9001`.

**Για να σταματήσετε την εφαρμογή:**
```bash
docker-compose -f docker/docker-compose.yml down
```

---
**Ομάδα 49 | Harokopio University of Athens | DevOps Project 2025** 