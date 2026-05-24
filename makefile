.PHONY: env clean
env: $(ENV_FILE)
	@$(MAKE) -C apps/api env
	@$(MAKE) -C apps/ui env
	@$(MAKE) -C .devcontainer env

clean:
	git clean -fdX -e "*.env"
