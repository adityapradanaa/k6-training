import http from "k6/http";
import { group } from "k6";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { validateResponseCode } from "../tests/base/validation.js";

const host = "https://test-api.k6.io/public";

export function handleSummary(data) {
  return {
    "public/summary.html": htmlReport(data),
  };
}

export const options = {
  thresholds: {
    http_req_failed: ["rate < 0.1"], // http errors should be less than 1%
    http_req_duration: ["p(95) < 200"], // 95% of requests should be below 200ms
  },
  abortOnFail: false,
  scenarios: {
    getMetrics: {
      executor: "per-vu-iterations",
      vus: parseInt(__ENV.VUS.trim()),
      iterations: parseInt(__ENV.ITERATION.trim()),
      maxDuration: `${parseInt(__ENV.DURATION.trim())}s`,
      exec: "getMetrics",
    },
  },
};

export function getMetrics() {
  //  Get Crocodile
  group("/metrics", () => {
    const response = http.get(`${host}/crocodiles/`);
    validateResponseCode(response, 200);
  });
}
