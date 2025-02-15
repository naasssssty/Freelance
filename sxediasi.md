# Τεύχος Σχεδιασμού και Υλοποίησης
## FreelancerProject
### Ομάδα 3

Μέλη Ομάδας:
- ANASTASIIA ZERVAS (ΑΜ: 2022119)
- Κωνσταντίνος Παπαδόγιαννης (ΑΜ: 2022141)

## 1. Εισαγωγή

### 1.1 Σκοπός του Έργου
Το FreelancerProject είναι μια πλατφόρμα διαχείρισης έργων πληροφορικής που συνδέει freelancers με πελάτες. Η πλατφόρμα επιτρέπει:
- Δημοσίευση και διαχείριση έργων πληροφορικής
- Αναζήτηση και υποβολή προτάσεων για έργα
- Διαχείριση χρηστών και επαλήθευση προφίλ
- Σύστημα αναφορών και επίλυσης διαφορών

### 1.2 Επισκόπηση Λειτουργικότητας
Το σύστημα υποστηρίζει τρεις βασικούς ρόλους:
1. Διαχειριστής (Admin)
    - Επιβεβαίωση νέων έργων
    - Επαλήθευση προφίλ freelancers
    - Διαχείριση αναφορών
    - Πρόσβαση σε όλα τα έργα

2. Πελάτης (Client)
    - Δημοσίευση νέων έργων
    - Διαχείριση αιτήσεων
    - Παρακολούθηση έργων
    - Υποβολή αναφορών

3. Freelancer
    - Αναζήτηση έργων
    - Υποβολή αιτήσεων
    - Επικοινωνία με πελάτες

## 2. Ανάλυση Απαιτήσεων

### 2.1 Λειτουργικές Απαιτήσεις

#### Authentication & Authorization
- Εγγραφή νέων χρηστών
- Σύνδεση με JWT tokens
- Role-based access control
- Επαλήθευση χρηστών

#### Διαχείριση Έργων
- Δημιουργία νέων έργων
- Αναζήτηση με βάση τον τίτλο
- Κατάσταση έργων (PENDING, APPROVED, DENIED)
- Προϋπολογισμός και προθεσμίες

#### Διαχείριση Αναφορών
- Υποβολή αναφορών
- Επεξεργασία κατάστασης (IN_REVIEW, RESOLVED, DISMISSED)
- Απαντήσεις διαχειριστή

### 2.2 Μη Λειτουργικές Απαιτήσεις
- Ασφάλεια: JWT authentication
- Επεκτασιμότητα: Microservices architecture
- Αξιοπιστία: Exception handling
- Απόδοση: Connection pooling με HikariCP

## 3. Αρχιτεκτονική Συστήματος

### 3.1 Backend (Spring Boot)

#### 3.1.1 Δομή Project

src/main/java/dit/hua/gr/backend/
├── config/          # Ρυθμίσεις εφαρμογής
│   ├── SecurityConfig.java    # JWT & CORS configuration
│   └── WebConfig.java        # Web configuration
├── controller/      # REST endpoints
│   ├── ApplicationController.java
│   ├── AuthenticationController.java
│   ├── ChatController.java
│   ├── ProjectController.java
│   ├── ReportController.java
│   └── UserController.java
├── dto/            # Data Transfer Objects
│   ├── ApplicationDTO.java
│   ├── MessageDTO.java
│   ├── ProjectResponseDTO.java
│   └── ReportDTO.java
├── model/          # Entities
│   ├── User.java
│   ├── Project.java
│   ├── Application.java
│   └── Report.java
├── repository/     # Data access
└── service/        # Business logic


#### 3.1.2 Βασικά Components

Security Configuration
java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
// JWT Authentication & Authorization
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) {
return http
.cors(cors -> cors.configurationSource(corsConfigurationSource()))
.csrf(AbstractHttpConfigurer::disable)
.authorizeHttpRequests(auth -> auth
.requestMatchers("/login", "/register").permitAll()
.requestMatchers("/user/**").hasRole("ADMIN")
// ... άλλοι περιορισμοί πρόσβασης
);
}
}


Controllers
Παράδειγμα από ProjectController:
java
@RestController
@RequestMapping("/project")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {
@PreAuthorize("hasRole('CLIENT')")
@PostMapping("/{username}/post")
public ResponseEntity<ProjectResponseDTO> postProject(
@PathVariable String username,
@RequestBody PostProjectDTO projectDTO) {
// ... υλοποίηση
}
}


#### 3.1.3 Database Schema
Χρησιμοποιούμε PostgreSQL με τους εξής πίνακες:

Users Table
sql
CREATE TABLE users (
id SERIAL PRIMARY KEY,
username VARCHAR(255) UNIQUE NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role VARCHAR(50) NOT NULL,
is_verified BOOLEAN DEFAULT FALSE
);


Projects Table
sql
CREATE TABLE projects (
id SERIAL PRIMARY KEY,
title VARCHAR(255) NOT NULL,
description TEXT,
budget DECIMAL,
deadline DATE,
status VARCHAR(50),
client_id INTEGER REFERENCES users(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


### 3.2 Διαχείριση Δεδομένων

#### 3.2.1 Connection Pool Configuration
properties
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.idle-timeout=30000
spring.datasource.hikari.pool-name=HikariPool-1
spring.datasource.hikari.max-lifetime=1800000


#### 3.2.2 JPA Configuration
properties
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true


### 3.3 API Endpoints

#### 3.3.1 Authentication
- POST /register: Εγγραφή νέου χρήστη
- POST /login: Σύνδεση χρήστη

#### 3.3.2 Projects
- GET /project/allProjects: Λίστα όλων των έργων (Admin)
- POST /project/{username}/post: Δημιουργία νέου έργου (Client)
- GET /project/title/{title}: Αναζήτηση έργων (Freelancer)

#### 3.3.3 Applications
- POST /project/{projectId}/apply/{username}: Υποβολή αίτησης
- GET /client/{username}/my-applications: Προβολή αιτήσεων πελάτη
- GET /freelancer/{username}/my-applications: Προβολή αιτήσεων freelancer

#### 3.3.4 Reports
- POST /api/reports: Δημιουργία αναφοράς
- GET /api/reports: Λίστα αναφορών (Admin)
- PUT /api/reports/{id}: Ενημέρωση κατάστασης αναφοράς
- ## 4. Υλοποίηση

### 4.1 Backend Implementation

#### 4.1.1 Models
Παράδειγμα από το User.java:
java
@Entity
@Table(name ="users")
public class User implements UserDetails {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Integer id;

    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name="password", nullable = false)
    private String password;

    @Enumerated(value = EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role = Role.CLIENT;

    @Column(name = "isVerified", nullable = false)
    private boolean isVerified = false;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL)
    private List<Project> projects;
}


#### 4.1.2 Services
Παράδειγμα από το ApplicationService:
java
@Service
public class ApplicationService {
public Application acceptApplication(Integer applicationId) {
Application application = applicationRepository.findById(applicationId)
.orElseThrow(() -> new RuntimeException("Application not found"));

        application.setApplicationStatus(ApplicationStatus.APPROVED);
        Project updated = application.getProject();
        updated.setFreelancer(application.getFreelancer());
        
        // Reject other applications
        List<Application> others = applicationRepository
            .findByProject(application.getProject());
        others.stream()
            .filter(a -> !a.equals(application))
            .forEach(a -> {
                a.setApplicationStatus(ApplicationStatus.REJECTED);
                applicationRepository.save(a);
            });
            
        return applicationRepository.save(application);
    }
}


### 4.2 Security Implementation

#### 4.2.1 JWT Configuration
java
@Service
public class JwtService {
private static final String SECRET_KEY = "your_jwt_secret";

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 24))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256)
            .compact();
    }
}


#### 4.2.2 CORS Configuration
java
@Configuration
public class WebConfig implements WebMvcConfigurer {
@Override
public void addCorsMappings(CorsRegistry registry) {
registry.addMapping("/**")
.allowedOrigins("http://localhost:3000")
.allowedMethods("GET", "POST", "PUT", "DELETE")
.allowCredentials(true);
}
}




