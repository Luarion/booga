FROM registry.fedoraproject.org/fedora:43 AS runtime

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Repositories
RUN dnf config-manager addrepo --from-repofile https://download.docker.com/linux/fedora/docker-ce.repo

RUN microdnf makecache && \
    microdnf install -y \
    # General
    curl \
    git \
    sudo \
    unzip \
    openssl \
    make \
    gettext-envsubst \
    ripgrep \
    # Python3
    python3 \
    # Docker
    containerd.io \
    docker-buildx-plugin \
    docker-ce \
    docker-ce-cli \
    docker-compose-plugin \
    hadolint \
    # Npm
    nodejs-npm \
    # Cleanup
    && microdnf clean all \
    && rm -rf /var/cache/dnf

# Bun
RUN npm install -g bun@1.3.10 \
    && npm cache clean --force

# act
WORKDIR /
RUN curl --proto '=https' --tlsv1.2 -sSfL https://raw.githubusercontent.com/nektos/act/master/install.sh | bash

WORKDIR /workspace

# Tests
RUN python3 --version && docker --version && bun --version && act --version
