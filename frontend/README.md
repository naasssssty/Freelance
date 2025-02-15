# 📌 FreelanceProject

## 👥 Ομάδα Ανάπτυξης
-[Ομάδα 3]
- [ANASTASIIA ZERVAS] - [ΑΜ: 2022119]
- [Κωνσταντίνος Παπαδόγιαννης] - [ΑΜ: 2022141]


## 📖 Περιγραφή της Εφαρμογής
Η εφαρμογή FreelancerProject είναι μια πλατφόρμα διαχείρισης έργων πληροφορικής για freelancers. Επιτρέπει στους πελάτες να δημοσιεύουν έργα, στους ελεύθερους επαγγελματίες να υποβάλλουν αιτήσεις και στον διαχειριστή να εγκρίνει έργα και προφίλ.

## 👥 Ρόλοι Χρηστών
1. Διαχειριστής (Admin)
    - Επιβεβαιώνει νέες καταχωρίσεις έργων
    - Επαληθεύει τα προφίλ των ελεύθερων επαγγελματιών
    - Διαχειρίζεται αναφορές και διαφορές
    - Έχει πρόσβαση σε όλα τα έργα μέσω του /projects/allProjects

2. Πελάτης (Client)
    - Δημοσιεύει νέα έργα μέσω του /projects/{username}/post
    - Εξετάζει τις αιτήσεις των freelancers
    - Παρακολουθεί την εξέλιξη του έργου
    - Μπορεί να υποβάλει αναφορές

3. Freelancer
    - Αναζητά έργα με τίτλο μέσω του /projects/title/{title}
    - Υποβάλλει αιτήσεις για έργα
    - Επικοινωνεί με τους πελάτες μέσω του συστήματος μηνυμάτων

## 🛠️ Τεχνική Τεκμηρίωση

### Αρχιτεκτονική
- Backend: REST API με Spring Boot
- Database: PostgreSQL, Render
- Authentication: JWT (JSON Web Tokens)
- API Documentation: Swagger UI

### Βασικά Endpoints
- POST /auth/register: Εγγραφή νέου χρήστη
- POST /auth/login: Σύνδεση χρήστη
- GET /projects/allProjects: Λίστα όλων των έργων (Admin only)
- POST /projects/{username}/post: Δημοσίευση νέου έργου (Client only)
- GET /projects/title/{title}: Αναζήτηση έργων με τίτλο (Freelancer only)


## 🛠️ Τεχνολογίες που χρησιμοποιούνται
- Backend: Spring Boot 3.4.1 (Spring MVC, Spring Security, Spring Data JPA)
- Frontend: React.js, Redux, Axios
- Γλώσσα Προγραμματισμού: Java 21
- Dependency Management: Maven
- Βάση Δεδομένων: PostgreSQL
- Database Management Tool: pgAdmin 4, Render SQL
- API Testing: Postman

## 🚀 Οδηγίες Εγκατάστασης και Εκτέλεσης

### 1. Προαπαιτούμενα
Πριν ξεκινήσετε, βεβαιωθείτε ότι έχετε εγκαταστήσει τα παρακάτω:
- Java 21: [Download](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html)
- Node.js & npm: [Download](https://nodejs.org/)
- Maven: [Download](https://maven.apache.org/install.html)
- PostgreSQL: [Download](https://www.postgresql.org/download/)
- pgAdmin 4: [Download](https://www.pgadmin.org/download/)

### 2. Ρύθμιση Βάσης Δεδομένων
1. Ανοίξτε το pgAdmin 4
2. Δημιουργήστε νέα βάση δεδομένων με όνομα freelancer_db
3. Ρυθμίστε το application.properties με τα στοιχεία σύνδεσης:
   properties
   spring.datasource.url=jdbc:postgresql://dpg-cun4aq23esus73amkca0-a.frankfurt-postgres.render.com:5432/dbfreelancer_ngy9
   spring.datasource.username=your_username
   spring.datasource.password=your_password


### 3. Εγκατάσταση και Εκτέλεση Backend
bash
# Κλωνοποίηση του repository
git clone https://github.com/naasssssty/Freelance.git

# Μετάβαση στον φάκελο του backend
cd TestFreelancerProject/backend

# Εγκατάσταση dependencies και build
mvn clean install

# Εκτέλεση της εφαρμογής
mvn spring-boot:run


### 4. Εγκατάσταση και Εκτέλεση Frontend
bash
# Μετάβαση στον φάκελο του frontend
cd ../frontend

# Εγκατάσταση dependencies
npm install
# Εκτέλεση της εφαρμογής
npm start


Η εφαρμογή θα είναι διαθέσιμη στη διεύθυνση: `http://localhost:3000`

## 🔒 Ασφάλεια και Authentication

Η εφαρμογή χρησιμοποιεί JWT (JSON Web Tokens) για authentication. Κάθε request στο API πρέπει να περιλαμβάνει ένα έγκυρο JWT token στο header:

Authorization: Bearer <token>
`