import {check, sleep, group} from "k6";
import http from "k6/http";

export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'http_req_duration{kind:html}': ["avg<=500"],
    }
};

export default function () {
    group("static", function () {
        check(http.get(`http://${__ENV.TARGET_HOSTNAME}:80`, {
            tags: {'kind': 'html'},
        }), {
            "status is 200": (res) => res.status === 200,
        });
    });
    sleep(1);
}