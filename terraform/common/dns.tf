locals {
  # effectively, this is donations.apis.holi.social
  donations_api_environments_zone_dns_name = "donations.${data.terraform_remote_state.holi_infra_state.outputs.dns_apis_zone_domain}."
}

# donations api environments zone
resource "google_dns_managed_zone" "donations_api_environments_zone" {
  project  = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name     = "donations-api-holi-social-environments-zone"
  dns_name = local.donations_api_environments_zone_dns_name
}

resource "google_dns_record_set" "donations_api_environments_zone_entry" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name    = local.donations_api_environments_zone_dns_name
  type    = "NS"
  ttl     = 300

  managed_zone = data.terraform_remote_state.holi_infra_state.outputs.dns_apis_zone_name

  rrdatas = google_dns_managed_zone.donations_api_environments_zone.name_servers
}

output "dns_donations_api_domain" {
  value = trim(google_dns_managed_zone.donations_api_environments_zone.dns_name, ".")
}

output "dns_donations_api_domain_name" {
  value = google_dns_managed_zone.donations_api_environments_zone.name
}
