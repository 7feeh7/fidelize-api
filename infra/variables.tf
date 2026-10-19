# Valores de entrada do Terraform. Vêm do arquivo infra/terraform.tfvars.
# Os que têm "default" são opcionais.
# Os do banco e do JWT viram variáveis de ambiente da Lambda (process.env).

# ---------- Banco de dados (PostgreSQL externo) ----------

variable "db_host" {
  type = string
}

variable "db_port" {
  type    = string
  default = "5432"
}

variable "db_user" {
  type = string
}

# sensitive = true esconde o valor nos logs do Terraform.
variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_name" {
  type = string
}

# "true" para bancos na nuvem (Neon, Supabase, RDS).
variable "db_ssl" {
  type    = string
  default = "true"
}

# ---------- Autenticação ----------

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "jwt_expires_in" {
  type    = string
  default = "1d"
}

variable "jwt_refresh_expires_in" {
  type    = string
  default = "7d"
}

# ---------- App ----------

# URL do frontend que pode chamar a API (CORS).
variable "cors_origin" {
  type = string
}

# Nome do negócio usado nas mensagens.
variable "business_name" {
  type    = string
  default = "Fidelizei"
}

# ---------- Rotina diária (horário de São Paulo) ----------

variable "daily_routine_hour" {
  type    = string
  default = "3"
}

variable "daily_routine_minute" {
  type    = string
  default = "0"
}
