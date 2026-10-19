# Nome do bucket criado. Deve ser o mesmo do infra/backend.tf.
output "state_bucket" {
  value = aws_s3_bucket.state.bucket
}
