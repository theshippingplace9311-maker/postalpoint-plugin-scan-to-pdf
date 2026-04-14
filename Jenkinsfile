// Jenkins pipeline for the Scan to PDF PostalPoint plugin.
// Produces scan-to-pdf-v<version>.zip as an archived artifact on every build.
pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci --omit=dev || npm install --omit=dev'
            }
        }
        stage('Build') {
            steps {
                sh 'chmod +x build.sh && ./build.sh'
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: 'scan-to-pdf-v*.zip', fingerprint: true, onlyIfSuccessful: true
        }
        cleanup {
            sh 'rm -rf node_modules scan-to-pdf-v*.zip'
        }
    }
}
