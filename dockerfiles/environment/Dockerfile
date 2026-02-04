FROM fedora:43 AS runtime

# Repositories
RUN dnf config-manager addrepo --from-repofile https://download.docker.com/linux/fedora/docker-ce.repo

RUN microdnf makecache && \
    microdnf install -y \
    # General
    curl-8.15.0 \
    git-2.52.0 \
    sudo-1.9.17 \
    unzip-6.0 \
    # Python3
    python3-3.14.2 \
    python3-pip-25.1.1 \
    # Docker
    containerd.io-2.2.1 \
    docker-buildx-plugin-0.30.1 \
    docker-ce-29.1.5 \
    docker-ce-cli-29.1.5 \
    docker-compose-plugin-5.0.1 \
    hadolint-2.12.0-21.fc43 \
    # Cleanup
    && microdnf clean all \
    && rm -rf /var/cache/dnf

# bun
COPY --from=oven/bun:1.3.6 /usr/local/bin/bun /usr/local/bin/bun

# act
WORKDIR /
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl --proto '=https' --tlsv1.2 -sSfL https://raw.githubusercontent.com/nektos/act/master/install.sh | bash

WORKDIR /workspace

# Tests
RUN python3 --version && docker --version && bun --version && act --version
