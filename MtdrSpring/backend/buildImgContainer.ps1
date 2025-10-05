#!/bin/bash

# Set Java 17 as the Java version for this build
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$JAVA_HOME/bin:$PATH

echo "Using Java version:"
java -version

docker stop agilecontainer
docker rm -f agilecontainer
docker rmi agileimage
mvn clean verify
docker build -f DockerfileDev --platform linux/amd64 -t agileimage:0.1 .
docker run --name agilecontainer -p 8080:8080 -d agileimage:0.1