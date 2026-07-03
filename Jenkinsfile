pipeline {
    agent any

    stages {

        stage('Project Verification') {
            steps {
                bat 'dir'
                echo 'Project downloaded successfully from GitHub.'
            }
        }

    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed.'
        }
    }
}