#!/bin/bash
# Script to create the Gemini API Key secret in Kubernetes

# Check if GEMINI_API_KEY is set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "Error: GEMINI_API_KEY environment variable is not set!"
    echo "Usage: export GEMINI_API_KEY='your-api-key' && ./create-gemini-secret.sh"
    exit 1
fi

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl command not found. Please install kubectl."
    exit 1
fi

echo "Creating Kubernetes secret for Gemini API Key..."

# Delete existing secret if it exists (to update it)
kubectl delete secret gemini-api-secret -n mtdrworkshop 2>/dev/null || true

# Create the secret
kubectl create secret generic gemini-api-secret \
  --from-literal=api-key="${GEMINI_API_KEY}" \
  -n mtdrworkshop

if [ $? -eq 0 ]; then
    echo "✅ Secret 'gemini-api-secret' created successfully in namespace 'mtdrworkshop'"
    echo ""
    echo "To verify the secret:"
    echo "  kubectl get secret gemini-api-secret -n mtdrworkshop"
else
    echo "❌ Failed to create secret"
    exit 1
fi
