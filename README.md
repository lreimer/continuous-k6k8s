# Continuous K6 Performance Tests on K8s

Continuous K6 performance and load tests on Kubernetes.

## Usage with plain YAML

```bash
# first we deploy the demo application deployment
$ kubectl apply -f continuous-nginx.yaml

# next you can deploy the K6 stack with InfluxDB and Grafana
$ kubectl apply -f continuous-k6k8s.yaml
```

## Using custom K6 load test Docker image

```bash
# build and push the K6 load test image
$ docker build -t k6-nginx-test .
$ docker tag k6-nginx-test lreimer/k6-nginx-test
$ docker push lreimer/k6-nginx-test

# run the image as a pod
# be sure to pass the --restart flag, otherwise the containers gets restarted
$ kubectl run k6-nginx-test --image lreimer/k6-nginx-test --restart=Never --attach
$ kubectl delete pod/k6-nginx-test
```

## Maintainer

M.-Leander Reimer (@lreimer), <mario-leander.reimer@qaware.de>

## License

This software is provided under the MIT open source license, read the `LICENSE` file for details.
