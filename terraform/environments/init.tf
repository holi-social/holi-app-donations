terraform {
  backend "gcs" {
    bucket = "holi-shared-terraform-state"
    prefix = "donations-api-environments"
  }
}

data "terraform_remote_state" "holi_infra_state" {
  backend = "gcs"
  config = {
    bucket = "holi-shared-terraform-state"
    prefix = "infra"
  }
}

data "terraform_remote_state" "holi_donations_api_common_state" {
  backend = "gcs"
  config = {
    bucket = "holi-shared-terraform-state"
    prefix = "donations-api-common"
  }
}

# provider google including beta features
provider "google" {
  region = "europe-north1"
}

provider "google-beta" {
  region = "europe-north1"
}

# API key intended to be used during local development
resource "google_apikeys_key" "development" {
  display_name = "places-api-key-development"
  name         = "places-api-key-development"
  project      = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id

  restrictions {
    api_targets {
      service = "places-backend.googleapis.com"
    }
  }
}

output "places-api-key-development" {
  value = google_apikeys_key.development.key_string
  sensitive = true
}
