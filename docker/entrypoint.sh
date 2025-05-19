#!/bin/bash
set -e

# Ξεκινάμε τον Docker daemon στο background
echo "Starting Docker daemon..."
sudo dockerd --host=unix:///var/run/docker.sock --host=tcp://0.0.0.0:2375 &

# Περιμένουμε λίγο για να βεβαιωθούμε ότι ο Docker daemon έχει ξεκινήσει
sleep 5

# Ελέγχουμε αν ο Docker daemon τρέχει
docker info >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "Docker daemon started successfully."
else
    echo "Failed to start Docker daemon. Check logs for details."
    exit 1
fi

# Εκτελούμε την αρχική εντολή του Jenkins (ή οποιαδήποτε άλλη εντολή περνάει)
echo "Starting Jenkins..."
exec "$@" 