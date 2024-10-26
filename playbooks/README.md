### Documentation for Building the Electron App and Environment Using Docker and Ansible Playbooks on Linux, macOS, and Windows

This documentation provides a step-by-step guide to build the Electron app and the environment using Docker and Ansible playbooks provided in this repository.

#### Prerequisites
- Docker installed on your machine.
- Ansible installed on your machine.
- Access to the repository `https://github.com/noatgnu/cauldron.git`.

#### Steps

1. **Clone the Repository**
   ```sh
   git clone https://github.com/noatgnu/cauldron.git
   cd cauldron
   ```

2. **Build the Docker Image**

  - **For Linux:**
    Create a `Dockerfile` in the root of the repository with the following content:
    ```Dockerfile
    FROM ubuntu:20.04

    # Install dependencies
    RUN apt-get update && apt-get install -y \
        curl \
        git \
        python3 \
        python3-pip \
        ansible \
        npm \
        nodejs \
        && rm -rf /var/lib/apt/lists/*

    # Set up working directory
    WORKDIR /app

    # Copy repository content
    COPY . /app
    ```

    Build the Docker image:
    ```sh
    docker build -t cauldron-builder-linux .
    ```

  - **For macOS:**
    Create a `Dockerfile` in the root of the repository with the following content:
    ```Dockerfile
    FROM osx-cross/xcode:latest

    # Install dependencies
    RUN brew install \
        curl \
        git \
        python3 \
        ansible \
        npm \
        node

    # Set up working directory
    WORKDIR /app

    # Copy repository content
    COPY . /app
    ```

    Build the Docker image:
    ```sh
    docker build -t cauldron-builder-macos .
    ```

  - **For Windows:**
    Create a `Dockerfile` in the root of the repository with the following content:
    ```Dockerfile
    FROM mcr.microsoft.com/windows/servercore:ltsc2022

    # Install dependencies
    RUN powershell -Command \
        Invoke-WebRequest -Uri https://chocolatey.org/install.ps1 -UseBasicParsing | Invoke-Expression; \
        choco install -y git python3 ansible nodejs-lts

    # Set up working directory
    WORKDIR /app

    # Copy repository content
    COPY . /app
    ```

    Build the Docker image:
    ```sh
    docker build -t cauldron-builder-windows .
    ```

3. **Run the Docker Container**

  - **For Linux:**
    ```sh
    docker run -it --rm -v $(pwd):/app cauldron-builder-linux /bin/bash
    ```

  - **For macOS:**
    ```sh
    docker run -it --rm -v $(pwd):/app cauldron-builder-macos /bin/bash
    ```

  - **For Windows:**
    ```sh
    docker run -it --rm -v %cd%:/app cauldron-builder-windows powershell
    ```

4. **Run Ansible Playbooks**

  - **Build and Release Electron App for Linux**
    ```sh
    ansible-playbook playbooks/linux.ansible.yml
    ```

  - **Build and Release R and Python Environment for Linux**
    ```sh
    ansible-playbook playbooks/linux.environment.ansible.yml
    ```

  - **Build and Release Electron App for macOS**
    ```sh
    ansible-playbook playbooks/darwin.ansible.yml
    ```

  - **Build and Release R and Python Environment for macOS**
    ```sh
    ansible-playbook playbooks/darwin.environment.ansible.yml
    ```

  - **Build and Release Electron App for Windows**
    ```sh
    ansible-playbook playbooks/windows.ansible.yml
    ```

  - **Build and Release R and Python Environment for Windows**
    ```sh
    ansible-playbook playbooks/windows.environment.ansible.yml
    ```

#### Notes
- Ensure that the paths specified in the Ansible playbooks are correctly set up in your Docker container.
- The Docker container should have all necessary dependencies installed as specified in the `Dockerfile`.
- The Ansible playbooks will handle the checkout, build, and upload processes as defined in the provided YAML files.

This documentation should help you set up and build the Electron app and environment using Docker and Ansible playbooks provided in this repository.
