#!/bin/bash

# Function to check Docker disk usage
check_docker_disk_usage() {
    local threshold=25
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

    if [ -z "$usage" ]; then
        echo "Error: Unable to get disk usage"
        return 1
    fi

    if [ "$usage" -ge "$threshold" ]; then
        echo "Disk usage is at ${usage}%. Cleaning up Docker..."
        docker system prune -af --volumes
        echo "Cleanup completed."
    else
        echo "Disk usage is at ${usage}%. No cleanup needed."
    fi
}

# Check and clean Docker storage if necessary
check_docker_disk_usage

docker-compose down
# Start Docker Compose with build
echo "Starting Docker Compose..."
docker-compose up --build

echo "Docker Compose started successfully."
