FROM registry.fedoraproject.org/fedora:43 AS runtime

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Repositories
RUN dnf config-manager addrepo --from-repofile https://download.docker.com/linux/fedora/docker-ce.repo

# TODO: finish versioning all packages
RUN microdnf makecache && \
    microdnf install -y \
    # General
    curl-8.15.0 \
    git-2.53.0 \
    sudo-1.9.17 \
    unzip-6.0 \
    openssl-3.5.4 \
    make-1:4.4.1-11.fc43 \
    envsubst \
    # Python3
    python3-3.14* \
    python3-pip-25.1.1 \
    python3-uv \
    # Docker
    containerd.io-2.2.1 \
    docker-buildx-plugin-0.30.1 \
    docker-ce-29.1.5 \
    docker-ce-cli-29.1.5 \
    docker-compose-plugin-5.0.1 \
    hadolint-2.12.0-21.fc43 \
    # Jupyter
    pandoc \
    # texlive-xetex \
    # texlive-tcolorbox \
    # Npm
    nodejs-npm-1:10.9.4-1.22.22.0.2.fc43 \
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
