# Continuous K6 Performance Tests on K8s

Continuous K6 performance and load tests on Kubernetes. We will spin up an InfluxDB to
store our load test data and Grafana to display. The K6 load test will continuously be
executed using a CronJob.

## Usage with plain YAML

```bash
# first we deploy the demo application deployment
$ kubectl apply -f continuous-nginx.yaml

# next you can deploy the K6 stack with InfluxDB and Grafana
$ kubectl apply -f continuous-k6k8s.yaml

# open Grafana and import on of these K6 load test dashboards
# - see https://grafana.com/dashboards/2587
# - see https://grafana.com/grafana/dashboards/4411
$ open http://localhost:3000
```

## Usage with Pulumi

Just for fun, I also created Pulumi infrastructure as code to create the Continuous K6 load test stack.

```bash
# to create the Pulumi code from scratch type this
$ pulumi new kubernetes-typescript --force
$ kube2pulumi typescript -f continuous-k6k8s.yaml

# and fire up the K6 stack
$ pulumi up

# open Grafana and import on of these K6 load test dashboards
# - see https://grafana.com/dashboards/2587
# - see https://grafana.com/grafana/dashboards/4411
$ open http://localhost:3000
```

## Create retention policy for InfluxDB

If you run the load tests continuously, you may want to create a retention policy to cleanup the test data from time to time.

```bash
# connect to the influx pod
$ kubectl exec -it pod/influxdb -- /bin/sh

$ influx
$ create retention policy "k6_1d" on "k6" duration 1d replication 1 default
$ exit
```

## Adhoc K6 load test with custom Docker image

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
