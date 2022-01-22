NAME := fastapi-react-template
REGISTRY := sarlos

build: build-npm
	docker build -t $(REGISTRY)/$(NAME)  .

build-test: build-npm
	docker build -t $(REGISTRY)/$(NAME):test .

push:
	docker push $(REGISTRY)/$(NAME)

push-test:
	docker push $(REGISTRY)/$(NAME):test

build-npm:
	cd ui && npm run build

release-local:
	cd misc/release && make

release-docker:
	cd misc/release && make docker

clean:
	docker system prune -f
