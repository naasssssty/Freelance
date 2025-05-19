#!/bin/bash
set -e

# Δεν χρειάζεται να ξεκινήσουμε Docker daemon, καθώς χρησιμοποιούμε το socket του host
echo "Using host Docker daemon via socket..."

# Ελέγχουμε αν το Docker socket είναι διαθέσιμο
if [ -S /var/run/docker.sock ]; then
    echo "Docker socket found at /var/run/docker.sock"
    # Προαιρετικά, αλλάζουμε τα δικαιώματα του socket αν χρειάζεται
    chmod 666 /var/run/docker.sock
else
    echo "WARNING: Docker socket not found at /var/run/docker.sock"
fi

# Βεβαιωνόμαστε ότι το Git είναι εγκατεστημένο
if ! command -v git &> /dev/null; then
    echo "Git not found, installing..."
    apt-get update && apt-get install -y git
else
    echo "Git is already installed"
fi

# Δημιουργούμε τον κατάλογο JENKINS_HOME αν δεν υπάρχει
if [ ! -d "${JENKINS_HOME}" ]; then
    echo "Creating Jenkins home directory at ${JENKINS_HOME}"
    mkdir -p "${JENKINS_HOME}"
    chown -R jenkins:jenkins "${JENKINS_HOME}"
fi

# Ρυθμίζουμε τα δικαιώματα για το workspace
if [ -d "${JENKINS_HOME}/workspace" ]; then
    echo "Setting permissions for Jenkins workspace"
    chown -R jenkins:jenkins "${JENKINS_HOME}/workspace"
fi

# Ρυθμίζουμε το Git config για τον χρήστη jenkins
echo "Configuring Git for Jenkins user"
git config --global --add safe.directory '*'
git config --global user.email "jenkins@example.com"
git config --global user.name "Jenkins"

# Εκτελούμε την αρχική εντολή του Jenkins
echo "Starting Jenkins..."
exec "$@" 