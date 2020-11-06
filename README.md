# Continuous K6 Performance Tests on K8s

Continuous K6 performance and load tests on Kubernetes.

## Usage with plain YAML

```bash
# first we deploy the demo application deployment
$ kubectl apply -f continuous-nginx.yaml

# next you can deploy the K6 stack with InfluxDB and Grafana
$ kubectl apply -f continuous-k6k8s.yaml
```

## Maintainer

M.-Leander Reimer (@lreimer), <mario-leander.reimer@qaware.de>

## License

This software is provided under the MIT open source license, read the `LICENSE` file for details.
