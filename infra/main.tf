# OlyBars Infrastructure Management
# Project Constitution Rule: Use us-west1 for all resources.

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = "ama-ecosystem-prod"
  region  = "us-west1"
}

# Cloud Run Service for the Backend
resource "google_cloud_run_v2_service" "backend" {
  name     = "olybars-backend"
  location = "us-west1"
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "us-west1-docker.pkg.dev/ama-ecosystem-prod/olybars/backend:latest"
      
      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = "ama-ecosystem-prod"
      }
      
      # OWNER_PIN and GEMINI_API_KEY should be set via Secrets Manager in production.
      # This is a scaffold.
    }
  }
}

# Firestore is typically managed via the Google Cloud Console or gcloud for simple setups,
# but can be added here if full IaC is desired.
