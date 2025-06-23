#!/bin/bash

echo "🚀 Setting up Jenkins for Freelance Platform CI/CD"

# Start Jenkins container
echo "📦 Starting Jenkins container..."
cd docker
docker-compose -f docker-compose-jenkins.yml up -d

# Wait for Jenkins to start
echo "⏳ Waiting for Jenkins to start..."
sleep 30

# Check Jenkins status
echo "🔍 Checking Jenkins status..."
until curl -f http://localhost:8080 > /dev/null 2>&1; do
    echo "Waiting for Jenkins to be available..."
    sleep 10
done

echo "✅ Jenkins is running!"

# Get initial admin password
echo "🔑 Getting Jenkins initial admin password..."
INITIAL_PASSWORD=$(docker exec freelance-jenkins cat /var/jenkins_home/secrets/initialAdminPassword)

echo "
🎉 Jenkins Setup Complete!

📋 Next Steps:
1. Open: http://localhost:8080
2. Use initial password: $INITIAL_PASSWORD
3. Install suggested plugins
4. Create admin user
5. Configure pipelines for:
   - Backend: jenkins/Jenkinsfile-backend
   - Frontend: jenkins/Jenkinsfile-frontend

💡 To create pipelines:
1. New Item → Pipeline
2. Pipeline → Pipeline script from SCM
3. SCM: Git
4. Repository URL: (your git repo)
5. Script Path: jenkins/Jenkinsfile-backend (or frontend)

🔧 Jenkins will deploy to your existing Kubernetes cluster!
"

echo "Jenkins URL: http://localhost:8080"
echo "Initial Password: $INITIAL_PASSWORD" 