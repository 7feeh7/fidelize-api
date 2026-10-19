# Bootstrap: roda UMA vez, na sua máquina, com usuário admin da AWS, antes do infra/.
# Cria o bucket S3 onde o Terraform do infra/ guarda o state
# (o arquivo que lembra o que já foi criado na AWS).

locals {
  # Nome do bucket precisa ser único no mundo todo.
  # Se já existir, troque aqui E no infra/backend.tf.
  state_bucket = "fidelizei-api-tfstate-7feeh7"
}

# Bucket privado e criptografado (padrão da AWS em buckets novos).
resource "aws_s3_bucket" "state" {
  bucket = local.state_bucket
}

# Guarda versões antigas do state. Se algo der errado, dá pra voltar.
resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id

  versioning_configuration {
    status = "Enabled"
  }
}
