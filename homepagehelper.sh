#!/bin/bash

# Created by Stanley Wisnioski -- wisnioskis | l3pr.org & hckr.fi

# Function to check if Docker is installed and up to date
check_docker() {
    echo "Checking for docker installation..."
    if ! command -v docker &> /dev/null; then
        echo "Docker is not installed"
        return 1
    fi

    if apt list --upgradeable 2>/dev/null | grep -q "docker"; then
        echo "Docker is installed but not up to date"
        return 1
    else
        echo "Docker is already installed and up to date"
        return 0
    fi
}

# Function to check if Docker Compose is installed and up to date
check_docker_compose() {
    echo "Checking for docker-compose installation..."
    if ! command -v docker-compose &> /dev/null; then
        echo "Docker Compose is not installed"
        return 1
    fi

    if apt list --upgradeable 2>/dev/null | grep -q "docker-compose"; then
        echo "Docker-compose is installed but not up to date"
        return 1
    else
        echo "Docker-compose is already installed and up to date"
        return 0
    fi
}

# Check if the script is run as root
if [[ $EUID -ne 0 ]]; then
    echo "This script must be run as root. Please rerun with sudo ./homepagehelper.sh <install | remove | update>"
    exit 1
fi

# Function to install Docker and Docker Compose
install_dependencies() {
    echo "Updating system"
    apt update && apt upgrade -y && apt autoremove -y
    echo "Installing docker and docker-compose..."
    apt install -y docker docker-compose
}

# Function to create docker-compose.yml file
create_docker_compose_file() {
    echo "Creating docker-compose.yml file..."
cat > docker-compose.yml <<EOF
version: "3.3"
services:
  homepage:
    image: ghcr.io/gethomepage/homepage:latest
    container_name: homepage
    ports:
      - 3000:3000
    volumes:
      - /Homepage/app/config:/app/config # Make sure your local config directory exists
      - /var/run/docker.sock:/var/run/docker.sock
EOF
}

# Function to set ownership for local config directory
set_config_directory_ownership() {
    echo "Setting ownership for local config directory..."
    # Ensure that the local directory exists
    mkdir -p /Homepage/app/config
}

# Function to update Docker container
update_container() {
    echo "Updating Docker container..."
    # Stop the running container
    docker container stop homepage

    # Run docker image list and get the image ID for "homepage"
    image_id=$(docker image ls | grep "homepage" | awk '{print $3}')

    # Check if the image ID is found
    if [ -z "$image_id" ]; then
        echo "Image 'homepage' not found"
        exit 1
    fi

    # Remove the image
    docker image rm "$image_id"

    # Start docker-compose
    docker-compose up -d
}

# Function to remove all traces of the application
remove_application() {
    echo "Are you sure you want to do this? This action is DESTRUCTIVE and IRREVERSIBLE!   (y/n):"
    read -r choice
    case "$choice" in
        y|Y)
            echo "Removing all traces of the homepage application..."
            # Stop the container
            docker container stop homepage
            # Remove the container
            docker container rm homepage
            # Remove the docker-compose.yml file
            rm -f docker-compose.yml
            # Run docker image list and get the image ID for "homepage"
            image_id=$(docker image ls | grep "homepage" | awk '{print $3}')
            # Check if the image ID is found
            if [ -n "$image_id" ]; then
                # Remove the image
                docker image rm "$image_id"
            fi
            # Remove the config directory
            rm -rf /Homepage
            ;;
        n|N)
            echo "Exiting removal process."
            exit 0
            ;;
        *)
            echo "Invalid choice. Exiting."
            exit 1
            ;;
    esac
}

# Main script logic
if [ "$1" == "install" ]; then
    if ! check_docker || ! check_docker_compose; then
        install_dependencies
    fi
    create_docker_compose_file
    set_config_directory_ownership
    docker-compose up -d
    echo "Installation completed successfully."
elif [ "$1" == "update" ]; then
    if ! check_docker || ! check_docker_compose; then
        echo "Docker or Docker Compose is not installed or not up to date."
        exit 1
    fi
    update_container
    echo "Update completed successfully."
elif [ "$1" == "remove" ]; then
    remove_application
    echo "Removal completed successfully."
else
    echo "Usage: $0 [install|update|remove]"
    exit 1
fi
