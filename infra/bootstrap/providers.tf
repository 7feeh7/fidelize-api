# Conecta o Terraform na AWS usando as credenciais da sua máquina ("aws configure").
provider "aws" {
  region = "sa-east-1" # São Paulo

  # Etiquetas colocadas em todos os recursos.
  default_tags {
    tags = {
      Project = "fidelizei-api"
      Managed = "terraform-bootstrap"
    }
  }
}
