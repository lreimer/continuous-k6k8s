NAME = continuous-testing
VERSION = 1.0.0
GCP = gcloud
ZONE = europe-west1-b
K8S = kubectl

.PHONY: info

info:
	@echo "Continunous Testing of Microservices on K8s"

prepare:
	@$(GCP) config set compute/zone $(ZONE)
	@$(GCP) config set container/use_client_certificate False

cluster:
	@echo "Create GKE Cluster"
	# --[no-]enable-basic-auth --[no-]issue-client-certificate

	@$(GCP) container clusters create $(NAME) --num-nodes=5 --enable-autoscaling --min-nodes=5 --max-nodes=10
	@$(K8S) create clusterrolebinding cluster-admin-binding --clusterrole=cluster-admin --user=$$(gcloud config get-value core/account)
	@$(K8S) cluster-info

gcloud-login:
	@$(GCP) auth application-default login

access-token:
	@$(GCP) config config-helper --format=json | jq .credential.access_token

destroy:
	@$(GCP) container clusters delete $(NAME) --async --quiet
