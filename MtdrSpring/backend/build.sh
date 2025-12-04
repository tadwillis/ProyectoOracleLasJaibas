#!/bin/bash
set -euo pipefail

echo "🚀 Starting backend build (build.sh)"

# -------------------------------
# ☕ JAVA_HOME
# -------------------------------
if [ -n "${JAVA_HOME:-}" ]; then
  export PATH="$JAVA_HOME/bin:$PATH"
fi

echo "Using Java version:"
java -version || true

# -------------------------------
# 🏗️ Build del JAR
# -------------------------------
echo "🏗️ Building JAR with Maven..."
mvn clean package spring-boot:repackage

# -------------------------------
# 🔍 Detectar si hay DOCKER_REGISTRY
# -------------------------------
IMAGE_VERSION="${IMAGE_VERSION:-0.1}"

if [ -n "${DOCKER_REGISTRY:-}" ]; then
  # ------- MODO OCI / REGISTRY DEFINIDO -------
  # DOCKER_REGISTRY viene ya con repo+nombre de imagen
  #   ej: qro.ocir.io/axjozjviyuvz/reacttodo/asdvp
  IMAGE_TAG="${DOCKER_REGISTRY}:${IMAGE_VERSION}"

  echo "📦 Using image tag (OCI mode): ${IMAGE_TAG}"
  echo "🐳 Building Docker image (linux/amd64) for registry..."

  docker build \
    --platform linux/amd64 \
    -f DockerfileDev \
    -t "${IMAGE_TAG}" \
    .

  echo "🚀 Pushing image to registry..."
  docker push "${IMAGE_TAG}"

  if [ $? -eq 0 ]; then
    echo "🧹 Cleaning local image..."
    docker rmi "${IMAGE_TAG}" || true
  fi

  echo "✅ Image built and pushed as linux/amd64: ${IMAGE_TAG}"
else
  # ------- MODO LOCAL / GITHUB ACTIONS -------
  # No hay DOCKER_REGISTRY ⇒ no intentamos pushear
  LOCAL_IMAGE_TAG="agileimage:${IMAGE_VERSION}"

  echo "ℹ️ DOCKER_REGISTRY not set. Running in LOCAL/CI mode (no push)."
  echo "📦 Using local image tag: ${LOCAL_IMAGE_TAG}"

  docker build \
    --platform linux/amd64 \
    -f DockerfileDev \
    -t "${LOCAL_IMAGE_TAG}" \
    .

  echo "✅ Local linux/amd64 image built: ${LOCAL_IMAGE_TAG}"
fi
