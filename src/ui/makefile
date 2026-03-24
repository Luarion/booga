RANDOM = $(shell openssl rand -base64 64 | tr -d '\n')

ENV_FILE := .env
ENV_TEMPLATE := .env.template

.PHONY: env
env: $(ENV_FILE)

$(ENV_FILE):
	envsubst < $(ENV_TEMPLATE) > $(ENV_FILE)
