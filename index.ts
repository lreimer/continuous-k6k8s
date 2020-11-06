import * as kubernetes from "@pulumi/kubernetes";
import * as fs from "fs";

const influxdbService = new kubernetes.core.v1.Service("influxdb-service", {
    metadata: {
        name: "influxdb-service",
    },
    spec: {
        type: "ClusterIP",
        ports: [
            { port: 8086, protocol: "TCP" }
        ],
        selector: {
            app: "influxdb",
        },
    },
});

const influxdbPod = new kubernetes.core.v1.Pod("influxdb", {
    metadata: {
        name: "influxdb",
        labels: { app: "influxdb" },
    },
    spec: {
        containers: [{
            name: "influxdb",
            image: "influxdb:1.8.3-alpine",
            env: [
                { name: "INFLUXDB_DB", value: "k6" }
            ],
            ports: [
                { name: "web", containerPort: 8086 }
            ]
        }]
    }
});

const grafanaService = new kubernetes.core.v1.Service("grafana-service", {
    metadata: {
        name: "grafana-service",
    },
    spec: {
        type: "LoadBalancer",
        ports: [
            { port: 3000, protocol: "TCP" }
        ],
        selector: {
            app: "grafana",
        }
    }
});

const datasourceConfigMap = new kubernetes.core.v1.ConfigMap("datasource-config", {
    metadata: {
        name: "datasource-config",
    },
    data: {
        "grafana-datasource.yaml": fs.readFileSync("grafana-datasource.yaml").toString()
    }
});

const grafanaPod = new kubernetes.core.v1.Pod("grafana", {
    metadata: {
        name: "grafana",
        labels: { app: "grafana" },
    },
    spec: {
        containers: [{
            name: "grafana",
            image: "grafana/grafana:7.3.1",
            env: [
                { name: "GF_AUTH_ANONYMOUS_ORG_ROLE", value: "Admin" },
                { name: "GF_AUTH_ANONYMOUS_ENABLED", value: "true" },
                { name: "GF_AUTH_BASIC_ENABLED", value: "false" },
            ],
            ports: [
                { name: "web", containerPort: 3000 }
            ],
            volumeMounts: [{
                name: "datasource-vol",
                mountPath: "/etc/grafana/provisioning/datasources/",
                readOnly: true,
            }],
        }],
        volumes: [{
            name: "datasource-vol",
            configMap: {
                name: datasourceConfigMap.metadata.name,
                items: [
                    { key: "grafana-datasource.yaml", path: "datasource.yaml" }
                ]
            }
        }]
    }
});

const scriptsConfigMap = new kubernetes.core.v1.ConfigMap("k6-scripts", {
    metadata: {
        name: "k6-scripts",
    },
    data: {
        "nginx-test.js": fs.readFileSync("nginx-test.js").toString()
    }
});

const testCronJob = new kubernetes.batch.v1beta1.CronJob("k6-nginx-test", {
    metadata: {
        name: "k6-nginx-test",
    },
    spec: {
        schedule: "*/1 * * * *",
        jobTemplate: {
            spec: {
                template: {
                    spec: {
                        containers: [{
                            name: "k6",
                            image: "loadimpact/k6:0.28.0",
                            env: [
                                { name: "K6_OUT", value: "influxdb=http://influxdb-service:8086/k6" },
                                { name: "TARGET_HOSTNAME", value: "nginx-service" },
                            ],
                            args: ["run", "/scripts/nginx-test.js"],
                            volumeMounts: [
                                { name: "scripts-vol", mountPath: "/scripts" }
                            ],
                        }],
                        restartPolicy: "Never",
                        volumes: [{
                            name: "scripts-vol",
                            configMap: {
                                name: scriptsConfigMap.metadata.name,
                            }
                        }]
                    }
                }
            }
        }
    }
});

export const cronJobName = testCronJob.metadata.name;
