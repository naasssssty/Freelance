#!/bin/bash
set -e

# Check if docker.sock exists and set permissions
if [ -S /var/run/docker.sock ]; then
    echo "Docker socket found. Setting permissions..."
    # Get the group ID of the docker socket
    DOCKER_GID=$(stat -c '%g' /var/run/docker.sock)
    # Check if the group exists, if not create it
    if ! getent group $DOCKER_GID; then
        groupadd -g $DOCKER_GID docker 2>/dev/null || echo "Failed to create group docker with GID $DOCKER_GID"
    fi
    # Add jenkins user to the docker group (continue even if it fails)
    usermod -aG $DOCKER_GID jenkins 2>/dev/null || echo "Failed to add jenkins user to group with GID $DOCKER_GID"
    echo "Permissions set for jenkins user (or attempted to set)."
    
    # Additional step to create a docker_host group with the same GID (continue even if it fails)
    groupadd -g $DOCKER_GID docker_host 2>/dev/null || echo "Failed to create group docker_host with GID $DOCKER_GID"
    usermod -aG docker_host jenkins 2>/dev/null || echo "Failed to add jenkins user to docker_host group"
    echo "Added jenkins user to docker_host group (or attempted to add)."
else
    echo "Docker socket not found at /var/run/docker.sock"
fi

# Execute the original entrypoint or command
exec "$@" 