#!/bin/bash
set -e

# Check if docker.sock exists and set permissions
if [ -S /var/run/docker.sock ]; then
    echo "Docker socket found. Setting permissions..."
    # Get the group ID of the docker socket
    DOCKER_GID=$(stat -c '%g' /var/run/docker.sock)
    # Check if the group exists, if not create it
    if ! getent group $DOCKER_GID; then
        groupadd -g $DOCKER_GID docker
    fi
    # Add jenkins user to the docker group
    usermod -aG $DOCKER_GID jenkins
    echo "Permissions set for jenkins user."
    
    # Additional step to create a docker_host group with the same GID (from docker-gid.sh logic)
    groupadd -g $DOCKER_GID docker_host 2>/dev/null || true
    usermod -aG docker_host jenkins
    echo "Added jenkins user to docker_host group."
else
    echo "Docker socket not found at /var/run/docker.sock"
fi

# Execute the original entrypoint or command
exec "$@" 