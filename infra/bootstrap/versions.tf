# Versões mínimas do Terraform e do plugin da AWS.
# Sem bloco "backend": o state do bootstrap fica local (bootstrap/terraform.tfstate).
terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.69"
    }
  }
}
