# CI/CD Pipeline — java-book-app-ear

## Pipeline Overview

```
Checkout → Lint → Test → Build → Docker Build → Docker Push → Deploy Staging → Deploy Production
```

| Stage | Tool | Purpose |
|---|---|---|
| Checkout | Jenkins SCM | Pull source code |
| Lint | Maven Checkstyle | Java code style enforcement |
| Test | mvn test | Unit tests via JUnit/Surefire |
| Build | mvn package | Build executable JAR |
| Docker Build | docker | Build container image tagged with `<git-sha>-<build-num>` |
| Docker Push | docker | Push image to registry (main/master/release branches only) |
| Deploy Staging | kubectl | Auto-deploy to staging after push |
| Deploy Production | kubectl + manual gate | Manual approval required before production deploy |

---

## Jenkins Setup

### Required Plugins

| Plugin | Purpose |
|---|---|
| Pipeline | Declarative pipeline support |
| Maven Integration | mvn tool support |
| Docker Pipeline | Docker build/push in pipeline |
| JUnit | Publish test results |
| Warnings Next Generation | Display Checkstyle lint results |
| Credentials Binding | Inject secrets into steps |
| Kubernetes CLI | kubectl access via kubeconfig credentials |

### Credentials to Configure

Go to **Manage Jenkins > Credentials > System > Global credentials**:

| Credential ID | Type | Description |
|---|---|---|
| `docker-registry-credentials` | Username/Password | Docker registry login |
| `kubeconfig-staging` | Secret file | kubeconfig for staging cluster |
| `kubeconfig-production` | Secret file | kubeconfig for production cluster |

### Tool Configuration

Go to **Manage Jenkins > Tools**:
- Add **Maven installation** named `M3` with version `3.9.x`
- Add **JDK installation** named `JDK17` with version `17`

---

## Prerequisites — Local Setup

### macOS

```bash
# Install Java 17
brew install openjdk@17
echo 'export JAVA_HOME=$(brew --prefix openjdk@17)' >> ~/.zshrc
source ~/.zshrc

# Install Maven
brew install maven

# Verify
java -version
mvn -version

# Install Docker Desktop
brew install --cask docker

# Install kubectl
brew install kubectl
```

### Ubuntu

```bash
# Install Java 17
sudo apt update
sudo apt install -y openjdk-17-jdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Install Maven
sudo apt install -y maven

# Verify
java -version
mvn -version

# Install Docker
sudo apt install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker $USER  # logout and back in after this

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

### Windows (PowerShell as Administrator)

```powershell
# Install Chocolatey (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install tools
choco install temurin17 -y       # Eclipse Temurin JDK 17
choco install maven -y
choco install docker-desktop -y
choco install kubernetes-cli -y

# Set JAVA_HOME
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.x.x-hotspot", "Machine")

# Verify
java -version
mvn -version
```

---

## Customization

### Change Docker Registry

```groovy
DOCKER_REGISTRY = 'ghcr.io'
IMAGE_REPO      = "${DOCKER_REGISTRY}/your-org/${APP_NAME}"
```

### Change Deployment Strategy

Switch to Helm:
```groovy
sh "helm upgrade --install ${APP_NAME} ./helm-chart --set image.tag=${IMAGE_TAG} -n staging"
```

### Add Slack Notifications

Uncomment and configure the `slackSend` line in the `post { failure { ... } }` block.

### Branch Strategy

- `main` / `master` — triggers full pipeline including push + deploy
- `release/*` — triggers build and push only (no deploy)
- Feature branches — runs lint, test, build only
