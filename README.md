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
