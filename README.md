<div align="center">

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" width="80" />

# Book App — Java Spring Boot

A full CRUD Book API with **Spring Boot** and **SQLite** — zero database setup, just run and demo.

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-00B4D8?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![K8s](https://img.shields.io/badge/Kubernetes-Ready-9B5DE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io)
[![License](https://img.shields.io/badge/License-MIT-06D6A0?style=for-the-badge)](LICENSE)

</div>

---

## API Endpoints

### Book CRUD

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/books` | List all books |
| `GET` | `/books/:id` | Get a single book |
| `GET` | `/books/search?q=clean` | Search by title or author |
| `GET` | `/books/count` | Total book count |
| `POST` | `/books` | Create a new book |
| `PUT` | `/books/:id` | Update a book |
| `DELETE` | `/books/:id` | Delete a book |

### DevOps

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Host IP address |
| `GET` | `/healthz` `/ready` `/live` `/status` | Health check |
| `GET` | `/ping` | Replies `pong` |
| `GET` | `/metrics` | Memory and uptime stats |
| `GET` | `/info` | Build and runtime metadata |

---

## Quick Start

### Prerequisites

```bash
sudo apt install openjdk-17-jdk maven -y
```

### Build & Run

```bash
mvn clean package -DskipTests
```

```bash
java -jar target/book-app-1.0.0.jar
```

Or run directly with Maven:

```bash
mvn spring-boot:run
```

> App starts on `http://localhost:8080` — SQLite database (`books.db`) is created automatically.

---

## Try It Out

### Create a book

```bash
curl -X POST http://localhost:8080/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Clean Code","author":"Robert C. Martin","isbn":"9780132350884","pages":464,"year":2008}'
```

### List all books

```bash
curl http://localhost:8080/books
```

### Get one book

```bash
curl http://localhost:8080/books/1
```

### Search

```bash
curl "http://localhost:8080/books/search?q=clean"
```

### Update a book

```bash
curl -X PUT http://localhost:8080/books/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Clean Code","author":"Robert C. Martin","isbn":"9780132350884","pages":464,"year":2009}'
```

### Delete a book

```bash
curl -X DELETE http://localhost:8080/books/1
```

### Health check

```bash
curl http://localhost:8080/healthz
```

### Ping

```bash
curl http://localhost:8080/ping
```

---

## Sample Responses

<details>
<summary><b>GET /books</b></summary>

```json
[
  {
    "id": 1,
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "9780132350884",
    "pages": 464,
    "year": 2008
  },
  {
    "id": 2,
    "title": "The Pragmatic Programmer",
    "author": "David Thomas",
    "isbn": "9780135957059",
    "pages": 352,
    "year": 2019
  }
]
```

</details>

<details>
<summary><b>POST /books</b></summary>

```json
{
  "id": 3,
  "title": "Kubernetes in Action",
  "author": "Marko Luksa",
  "isbn": "9781617293726",
  "pages": 624,
  "year": 2018
}
```

</details>

<details>
<summary><b>GET /healthz</b></summary>

```json
{
  "status": "ok"
}
```

</details>

<details>
<summary><b>GET /info</b></summary>

```json
{
  "app": "java-book-app",
  "version": "1.0.0",
  "java": "17.0.10",
  "platform": "Linux",
  "arch": "aarch64",
  "env": "production"
}
```

</details>

---

## Docker

### Build

```bash
docker build -t book-app .
```

### Run

```bash
docker run -p 8080:8080 book-app
```

---

## Project Structure

```
java-book-app-ear/
├── src/main/java/com/itdefined/bookapp/
│   ├── BookAppApplication.java         # Spring Boot entry point
│   ├── model/
│   │   └── Book.java                   # Book entity (JPA)
│   ├── repository/
│   │   └── BookRepository.java         # Data access (auto-generated CRUD)
│   └── controller/
│       ├── BookController.java         # Book CRUD endpoints
│       └── AppController.java          # Health, metrics, info
├── src/main/resources/
│   └── application.properties          # SQLite + server config
├── pom.xml                             # Maven build config
├── Dockerfile                          # Multi-stage Docker build
├── loadtest.js                         # k6 full CRUD load test
├── loadtest-simple.js                  # k6 simple benchmark
└── README.md
```

---

## Why SQLite?

| | SQLite | PostgreSQL |
|---|---|---|
| **Install** | Nothing — just a file | Server + config + credentials |
| **Run** | `java -jar app.jar` and done | Need Docker Compose or remote DB |
| **File** | `books.db` created automatically | Needs `CREATE DATABASE` |
| **Good for** | Dev, demos, class | Production, multi-user |

> SQLite is perfect for learning. When ready for production, just change `application.properties` to point to PostgreSQL — the code stays the same.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server listen port |
| `APP_ENV` | `production` | Runtime environment label |

---

## What is a JAR vs WAR vs EAR?

| Format | Full Name | Contains | Deployed To |
|--------|-----------|----------|-------------|
| **JAR** | Java Archive | Classes + libs (fat JAR) | `java -jar app.jar` |
| **WAR** | Web Archive | JAR + servlets + HTML | Tomcat, Jetty |
| **EAR** | Enterprise Archive | Multiple JARs + WARs | WebLogic, WildFly (legacy) |

> This app builds a **fat JAR** — the modern standard. Spring Boot embeds Tomcat inside the JAR, so no external server needed.

---

## Load Testing with k6

[k6](https://k6.io) is the modern industry-standard load testing tool — write tests in JavaScript, run from CLI, perfect for CI/CD.

### Install k6

<details>
<summary><b>macOS</b></summary>

```bash
brew install k6
```

</details>

<details>
<summary><b>Ubuntu / Debian</b></summary>

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D68
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt update
sudo apt install k6 -y
```

</details>

<details>
<summary><b>Windows</b></summary>

Option 1 — Chocolatey:
```bash
choco install k6
```

Option 2 — Winget:
```bash
winget install k6 --source winget
```

Option 3 — Download MSI from [k6.io/docs/get-started/installation](https://k6.io/docs/get-started/installation/)

</details>

Verify installation:

```bash
k6 version
```

### Run load tests

Make sure the app is running first:

```bash
mvn spring-boot:run
```

**Simple benchmark** — 20 users hitting `/books` for 30 seconds:

```bash
k6 run loadtest-simple.js
```

**Full CRUD test** — ramps from 10 → 50 users, tests create, list, get, search, delete:

```bash
k6 run loadtest.js
```

**Custom target URL** (e.g. remote server):

```bash
k6 run -e BASE_URL=http://192.168.1.100:8080 loadtest.js
```

### Understanding the output

```
     checks.........................: 100.00% ✓ 1842  ✗ 0
     http_req_duration..............: avg=12.5ms  min=1ms  p(95)=45ms  p(99)=89ms
     http_req_failed................: 0.00%   ✓ 0     ✗ 1842
     http_reqs......................: 1842    46.05/s
     vus............................: 1       min=1    max=50
```

| Metric | What it means |
|--------|---------------|
| **checks** | % of assertions passed (should be 100%) |
| **http_req_duration avg** | Average response time |
| **http_req_duration p(95)** | 95% of requests were faster than this |
| **http_req_failed** | Error rate (should be 0%) |
| **http_reqs** | Total requests and requests/sec throughput |
| **vus** | Virtual users (concurrent connections) |

### k6 test stages explained

The `loadtest.js` uses ramping stages:

```
Users
  50 │          ┌──────────┐
     │         /            \
  10 │────────/              \
     │                        \
   0 │─────────────────────────────
     0s     10s    30s     40s
       Ramp up   Sustain   Ramp down
```

### Thresholds (auto pass/fail)

The test is configured with automatic pass/fail criteria:

```javascript
thresholds: {
  http_req_duration: ['p(95)<500'],   // 95% of requests must be under 500ms
  http_req_failed: ['rate<0.01'],     // less than 1% error rate
}
```

If thresholds are breached, k6 exits with code 99 — perfect for CI/CD pipelines to fail the build.

### Common k6 commands

| Command | What it does |
|---------|-------------|
| `k6 run test.js` | Run the load test |
| `k6 run --vus 100 --duration 60s test.js` | Override users and duration |
| `k6 run -e BASE_URL=http://remote:8080 test.js` | Custom environment variable |
| `k6 run --out json=results.json test.js` | Export results to JSON |
| `k6 run --out csv=results.csv test.js` | Export results to CSV |

---

<div align="center">

**Built for DevOps training at ITDefined.org** · Spring Boot · SQLite · Docker · k6 · Kubernetes

</div>
