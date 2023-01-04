CONTAINER_NAME := fastapi-react-template
REGISTRY := sarlos.jp
IMAGE := $(REGISTRY)/$(CONTAINER_NAME)

VER ?= latest

build: build_npm
	docker build -t $(IMAGE):$(VER) --progress plain .

build_test: build_npm
	docker build -t $(IMAGE):test --progress plain .

push: build
	docker push $(IMAGE):$(VER)

push_test: build_test
	docker push $(IMAGE):test

build_npm:
	cd ui && npm run build

release_prod: push
	cd misc/release && ansible-playbook -e registry=$(REGISTRY) -e container_name=$(CONTAINER_NAME) -e image_tag=$(VER) -i inventory/prod.yml tasks.yml

release_stage: push_test
	cd misc/release && ansible-playbook -e registry=$(REGISTRY) -e container_name=$(CONTAINER_NAME) -e image_tag=test -i inventory/stage.yml tasks.yml

release_local: push_test
	cd misc/release && ansible-playbook -e registry=$(REGISTRY) -e container_name=$(CONTAINER_NAME) -e image_tag=test -i inventory/localhost.yml tasks.yml

clean:
	docker system prune -f
