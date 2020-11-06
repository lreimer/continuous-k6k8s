import {check, group} from "k6";
import http from "k6/http";

export let options = {
    thresholds: {
        'http_req_duration{kind:html}': ["avg<=500"],
    }
};

export default function () {
    group("static", function () {
        check(http.get("http://nginx-service:80", {
            tags: {'kind': 'html'},
        }), {
            "status is 200": (res) => res.status === 200,
        });
    });
}