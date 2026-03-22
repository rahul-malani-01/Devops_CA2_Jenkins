pipeline {
  agent any

  environment {
    HEADLESS = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        bat 'npm ci'
      }
    }

    stage('Run Selenium Tests') {
      steps {
        bat 'npm run test:selenium'
      }
    }
  }

  post {
    always {
      echo 'Build completed. Headless mode used for Jenkins execution.'
      archiveArtifacts artifacts: 'tests/**/*.js', fingerprint: true
    }
    success {
      echo 'Build successful: Selenium tests passed.'
    }
    failure {
      echo 'Build failed: One or more Selenium tests failed.'
    }
  }
}
