# Conecta o Terraform na AWS. As credenciais vêm do ambiente
# (GitHub Actions via OIDC, ou "aws configure" na sua máquina).
provider "aws" {
  region = "sa-east-1" # São Paulo

  # Etiquetas colocadas em todos os recursos, pra achar eles fácil no console.
  default_tags {
    tags = {
      Project = "fidelizei-api"
      Managed = "terraform"
    }
  }
}
