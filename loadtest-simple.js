// ──────────────────────────────────────────────
// k6 Simple Load Test — just hit endpoints
// Run: k6 run loadtest-simple.js
// ──────────────────────────────────────────────

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export const options = {
  vus: 20,              // 20 virtual users
  duration: '30s',      // run for 30 seconds
};

export default function () {
  const res = http.get(`${BASE_URL}/books`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(0.5);
}
