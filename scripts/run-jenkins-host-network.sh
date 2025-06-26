#!/bin/bash

echo "🚀 Starting Jenkins with HOST NETWORKING for minikube access..."

# Stop existing Jenkins container if running
docker stop jenkins 2>/dev/null || true
docker rm jenkins 2>/dev/null || true

# Run Jenkins with host networking
docker run -d \
  --name jenkins \
  --network=host \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(pwd):/workspace \
  -e JAVA_OPTS="-Djenkins.install.runSetupWizard=false" \
  jenkins/jenkins:lts

echo "✅ Jenkins started with host networking!"
echo "🌐 Access Jenkins at: http://localhost:8080"
echo "🔑 Get admin password: docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword"

# Wait for Jenkins to start
echo "⏳ Waiting for Jenkins to start..."
sleep 30

# Show status
docker ps | grep jenkins
echo ""
echo "🎯 Now Jenkins can access minikube at 127.0.0.1:8443!" 