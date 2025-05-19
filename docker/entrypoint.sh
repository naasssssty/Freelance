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

# Εκτελούμε την αρχική εντολή του Jenkins
echo "Starting Jenkins..."
exec "$@" 