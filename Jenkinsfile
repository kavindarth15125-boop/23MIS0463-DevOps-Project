pipeline {
    agent any

    environment {
        IMAGE_NAME = "intranet-portal"
        DOCKERHUB_USER = "yourdockerhubusername"   // <-- change this
        IMAGE_TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                // Pulls the latest code from GitHub
                git branch: 'main', url: 'https://github.com/yourusername/your-repo.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Push to Docker Hub (optional)') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DUSER', passwordVariable: 'DPASS')]) {
                    sh "echo $DPASS | docker login -u $DUSER --password-stdin"
                    sh "docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh "kubectl apply -f k8s/deployment.yaml"
                sh "kubectl apply -f k8s/service.yaml"
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully. Take a screenshot of this console output.'
        }
        failure {
            echo 'Pipeline failed. Check logs above.'
        }
    }
}
