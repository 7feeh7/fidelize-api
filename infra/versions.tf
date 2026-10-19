# Versões mínimas do Terraform e dos plugins.
terraform {
  required_version = ">= 1.10"

  required_providers {
    # Cria os recursos na AWS.
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.69" # aceita 6.x a partir de 6.69, nunca 7.x
    }

    # Gera o zip do código provisório da Lambda.
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.7"
    }
  }
}
