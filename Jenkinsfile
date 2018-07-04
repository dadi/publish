pipeline {
  agent any

  environment {
    IMAGE_TAG = sh (
      script: "echo '${env.JOB_NAME.toLowerCase()}' | tr '/' '-' | sed 's/%2f/-/g'",
      returnStdout: true
    ).trim()
  }

  stages {
    stage('git') {
      steps {
        checkout([$class: 'GitSCM', branches: [[name: '*/master']], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'SubmoduleOption', disableSubmodules: false, parentCredentials: false, recursiveSubmodules: true, reference: '', trackingSubmodules: false]], submoduleCfg: [], userRemoteConfigs: [[url: 'https://github.com/dadi/publish-dev']]])
      }
    }

    stage('Build') {    
      steps {
        echo "Building...${IMAGE_TAG}_api"

        sh "docker build -t ${IMAGE_TAG}_api api"

        echo "Setting @dadi/publish dependency to branch ${GIT_BRANCH}"
        sh "sed -i -e 's:publish#master:publish#${GIT_BRANCH}:g' publish/package.json"

        echo "Building...${IMAGE_TAG}_publish"

        sh "docker build -t ${IMAGE_TAG}_publish publish"
      }
    }

    stage('Deploy') {
      steps {
        echo 'Deploying...'

        sh "docker container ls -a -fname=${IMAGE_TAG}_api -q | xargs -r docker container rm"
        sh "docker container ls -a -fname=${IMAGE_TAG}_publish -q | xargs -r docker container rm"
      }
    }
  }
}
