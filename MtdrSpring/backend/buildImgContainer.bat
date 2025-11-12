#!/bin/bash
set -euo pipefail

# usar Java 17 (coincide con tu build)
export JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null || true)
if [ -n "${JAVA_HOME:-}" ]; then
  export PATH="$JAVA_HOME/bin:$PATH"
fi

echo "Using Java version:"
java -version || true

# parar/eliminar contenedor si existe (sin fallar)
docker stop agilecontainer 2>/dev/null || true
docker rm -f agilecontainer 2>/dev/null || true

# eliminar solo la etiqueta usada (si existe), no todo el repo
docker rmi agileimage:0.1 2>/dev/null || true

# build de la app
mvn clean verify

# build de imagen (SIN forzar --platform) -> usa la del host (ARM en Mac, x86 en Win/Linux)
# --pull y --no-cache para evitar que te “recuerde” bases viejas
docker build -f DockerfileDev -t agileimage:0.1 . --pull --no-cache

# run en 8080
docker run --name agilecontainer -p 8080:8080 -d agileimage:0.1
