FROM loadimpact/k6:0.28.0

COPY nginx-test.js .

ENV K6_OUT=influxdb=http://influxdb-service:8086/k6
ENV TARGET_HOSTNAME=nginx-service

ENTRYPOINT ["k6", "run", "nginx-test.js"]