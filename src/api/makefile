.PHONY: generate-env
generate-env:
	@export JWT_SECRET=$$(openssl rand -base64 64 | tr -d '\n'); envsubst < .env.template > .env
