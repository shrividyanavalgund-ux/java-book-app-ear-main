// ──────────────────────────────────────────────
// k6 Load Test — Book App API
// Run: k6 run loadtest.js
// ──────────────────────────────────────────────

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // ramp up to 10 users
    { duration: '20s', target: 50 },   // ramp up to 50 users
    { duration: '10s', target: 0 },    // ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95% of requests must finish within 500ms
    http_req_failed: ['rate<0.05'],     // less than 5% can fail (SQLite has limited concurrency)
  },
};

const headers = { 'Content-Type': 'application/json' };

export default function () {

  // ── Health check ──
  let res = http.get(`${BASE_URL}/healthz`);
  check(res, { 'healthz is 200': (r) => r.status === 200 });

  // ── Create a book ──
  const book = JSON.stringify({
    title: `Book ${Date.now()}`,
    author: 'Load Test Author',
    isbn: '9780000000000',
    pages: 200,
    year: 2026,
  });

  res = http.post(`${BASE_URL}/books`, book, { headers });
  check(res, { 'create book 200': (r) => r.status === 200 });

  const bookId = res.json('id');

  // ── List all books ──
  res = http.get(`${BASE_URL}/books`);
  check(res, { 'list books 200': (r) => r.status === 200 });

  // ── Get single book ──
  if (bookId) {
    res = http.get(`${BASE_URL}/books/${bookId}`);
    check(res, { 'get book 200': (r) => r.status === 200 });
  }

  // ── Search ──
  res = http.get(`${BASE_URL}/books/search?q=Load`);
  check(res, { 'search 200': (r) => r.status === 200 });

  // ── Delete the book (cleanup) ──
  // 204 = deleted, 404 = already gone (race condition under load — expected with SQLite)
  if (bookId) {
    res = http.del(`${BASE_URL}/books/${bookId}`);
    check(res, { 'delete book': (r) => r.status === 204 || r.status === 404 });
  }

  sleep(1);
}
