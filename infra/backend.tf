# Onde o Terraform guarda o "state": o arquivo que lembra o que já foi criado na AWS.
# Fica num bucket S3 (criado pelo infra/bootstrap) pra funcionar igual no seu PC e no GitHub Actions.
terraform {
  backend "s3" {
    bucket       = "fidelizei-api-tfstate-7feeh7" # mesmo nome do bootstrap
    key          = "fidelizei-api/terraform.tfstate"
    region       = "sa-east-1"
    use_lockfile = true # impede dois deploys ao mesmo tempo
  }
}
