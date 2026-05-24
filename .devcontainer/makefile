RANDOM = $(shell openssl rand -base64 32 | tr -d '\n')

ENV_FILE := .env
ENV_TEMPLATE := .env.template

.PHONY: env
env: $(ENV_FILE)

$(ENV_FILE):
	@export POSTGRES_USER="$(RANDOM)" \
	POSTGRES_PASSWORD="$(RANDOM)" && \
	envsubst < $(ENV_TEMPLATE) > $(ENV_FILE)
