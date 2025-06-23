# Jenkins Setup Guide για Frontend Pipeline

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