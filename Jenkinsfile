pipeline {
    agent any

    tools {
        maven 'M3'
        jdk   'JDK17'
    }

    environment {
        APP_NAME        = 'java-book-app-ear'
        DOCKER_REGISTRY = 'your-registry.io'
        IMAGE_REPO      = "${DOCKER_REGISTRY}/org/${APP_NAME}"
        IMAGE_TAG       = "${env.GIT_COMMIT[0..7]}-${env.BUILD_NUMBER}"
        DOCKER_CREDS    = credentials('docker-registry-credentials')
        MAVEN_OPTS      = '-Xmx1024m -XX:MaxMetaspaceSize=256m'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Lint') {
            steps {
                sh 'mvn checkstyle:check --no-transfer-progress'
            }
            post {
                always {
                    recordIssues(
                        tools: [checkStyle(pattern: '**/checkstyle-result.xml')],
                        failOnError: false
                    )
                }
            }
        }

        stage('Test') {
            steps {
                sh 'mvn test --no-transfer-progress'
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Build') {
            steps {
                sh 'mvn clean package -DskipTests --no-transfer-progress'
            }
            post {
                success {
                    archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh """
                    docker build \\
                        --build-arg APP_VERSION=${IMAGE_TAG} \\
                        -t ${IMAGE_REPO}:${IMAGE_TAG} \\
                        -t ${IMAGE_REPO}:latest \\
                        .
                """
            }
        }

        stage('Docker Push') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch pattern: 'release/.*', comparator: 'REGEXP'
                }
            }
            steps {
                sh "echo ${DOCKER_CREDS_PSW} | docker login ${DOCKER_REGISTRY} -u ${DOCKER_CREDS_USR} --password-stdin"
                sh "docker push ${IMAGE_REPO}:${IMAGE_TAG}"
                sh "docker push ${IMAGE_REPO}:latest"
            }
        }

        stage('Deploy to Staging') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo "Deploying ${IMAGE_REPO}:${IMAGE_TAG} to Staging..."
                withCredentials([file(credentialsId: 'kubeconfig-staging', variable: 'KUBECONFIG')]) {
                    sh """
                        kubectl set image deployment/${APP_NAME} \\
                            app=${IMAGE_REPO}:${IMAGE_TAG} \\
                            --namespace=staging
                        kubectl rollout status deployment/${APP_NAME} \\
                            --namespace=staging --timeout=120s
                    """
                }
            }
        }

        stage('Deploy to Production') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    input message: "Deploy ${APP_NAME}:${IMAGE_TAG} to Production?",
                          ok: 'Deploy',
                          submitter: 'ops-team'
                }
                echo "Deploying ${IMAGE_REPO}:${IMAGE_TAG} to Production..."
                withCredentials([file(credentialsId: 'kubeconfig-production', variable: 'KUBECONFIG')]) {
                    sh """
                        kubectl set image deployment/${APP_NAME} \\
                            app=${IMAGE_REPO}:${IMAGE_TAG} \\
                            --namespace=production
                        kubectl rollout status deployment/${APP_NAME} \\
                            --namespace=production --timeout=180s
                    """
                }
            }
        }
    }

    post {
        always {
            sh "docker rmi ${IMAGE_REPO}:${IMAGE_TAG} || true"
            cleanWs()
        }
        success {
            echo "Pipeline succeeded: ${APP_NAME} ${IMAGE_TAG}"
        }
        failure {
            echo "Pipeline failed: ${APP_NAME} ${IMAGE_TAG} — check logs above"
            // slackSend channel: '#ci-alerts', color: 'danger', message: "FAILED: ${APP_NAME} ${IMAGE_TAG} on ${env.BRANCH_NAME}"
        }
    }
}
