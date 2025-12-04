#!/bin/bash
set -euo pipefail

echo "🚀 Starting backend build (build.sh)"

# -------------------------------
# ☕ JAVA_HOME (en OCI ya viene del YAML)
# -------------------------------
if [ -n "${JAVA_HOME:-}" ]; then
  export PATH="$JAVA_HOME/bin:$PATH"
fi

echo "Using Java version:"
java -version || true

# -------------------------------
# 📦 Variables de imagen desde el YAML
# -------------------------------
# DOCKER_REGISTRY ya viene con el repo e imagen:
#   qro.ocir.io/axjozjviyuvz/reacttodo/asdvp
# IMAGE_VERSION = 0.1
if [ -z "${DOCKER_REGISTRY:-}" ]; then
  echo "❌ DOCKER_REGISTRY env variable needs to be set!"
  exit 1
fi

IMAGE_VERSION="${IMAGE_VERSION:-0.1}"
IMAGE_TAG="${DOCKER_REGISTRY}:${IMAGE_VERSION}"

echo "📦 Using image tag: ${IMAGE_TAG}"

# -------------------------------
# 🏗️ Build del JAR
# ------------
