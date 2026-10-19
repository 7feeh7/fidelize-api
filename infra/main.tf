# Infraestrutura da API. Roda MANUALMENTE (terraform apply), só quando:
#   - for criar tudo pela primeira vez, ou
#   - for mudar a infra (memória, timeout, variáveis de ambiente, horário da rotina...).
# O código da API NÃO é publicado aqui: quem publica é o GitHub Actions a cada push na main.

locals {
  # Nome base usado em todos os recursos criados na AWS.
  name = "fidelizei-api"

  # Repositório do GitHub que pode publicar o código na Lambda.
  github_repo = "7feeh7/fidelize-api"
}

# ------------------------------------------------------------
# Lambda: roda a API Express
# ------------------------------------------------------------

# Identidade (role) que a Lambda usa enquanto roda.
resource "aws_iam_role" "lambda" {
  name = "${local.name}-lambda"

  # Diz que só o serviço Lambda pode usar esta role.
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# Dá permissão para a Lambda escrever logs (console.log) no CloudWatch.
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Onde os logs da Lambda ficam guardados. Apaga depois de 14 dias.
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.name}"
  retention_in_days = 14
}

# Código provisório, usado só para CRIAR a Lambda (a AWS não deixa criar sem código).
# Responde 503 até o primeiro deploy do GitHub Actions trocar pelo código real.
data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/.build/placeholder.zip"

  source {
    filename = "index.js"
    content  = <<-JS
      exports.handler = async () => ({
        statusCode: 503,
        body: JSON.stringify({ message: "Deploy pendente" }),
      });
    JS
  }
}

# A função em si.
resource "aws_lambda_function" "api" {
  function_name = local.name
  role          = aws_iam_role.lambda.arn
  runtime       = "nodejs24.x"
  handler       = "index.handler" # arquivo index.js, função exportada "handler"
  memory_size   = 512             # MB
  timeout       = 120             # segundos (o API Gateway corta requisições HTTP em 30s; os 120s servem para a rotina diária)

  filename         = data.archive_file.placeholder.output_path
  source_code_hash = data.archive_file.placeholder.output_base64sha256

  # Variáveis de ambiente (process.env) da API. Valores vêm do terraform.tfvars.
  environment {
    variables = {
      DB_HOST                = var.db_host
      DB_PORT                = var.db_port
      DB_USER                = var.db_user
      DB_PASSWORD            = var.db_password
      DB_NAME                = var.db_name
      DB_SSL                 = var.db_ssl
      JWT_SECRET             = var.jwt_secret
      JWT_EXPIRES_IN         = var.jwt_expires_in
      JWT_REFRESH_EXPIRES_IN = var.jwt_refresh_expires_in
      CORS_ORIGIN            = var.cors_origin
      BUSINESS_NAME          = var.business_name
    }
  }

  # Depois de criada, o Terraform não mexe mais no código.
  # Sem isso, todo "terraform apply" voltaria a Lambda para o código provisório.
  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }

  # Cria os logs e a permissão de log antes da função.
  depends_on = [
    aws_cloudwatch_log_group.lambda,
    aws_iam_role_policy_attachment.lambda_logs,
  ]
}

# ------------------------------------------------------------
# API Gateway: expõe a API na internet (HTTPS)
# ------------------------------------------------------------

# A API pública. Gera um endereço https://xxxx.execute-api.sa-east-1.amazonaws.com.
# Tipo HTTP = versão mais simples e barata do API Gateway.
# CORS não é configurado aqui porque o Express já cuida disso.
resource "aws_apigatewayv2_api" "http" {
  name          = local.name
  protocol_type = "HTTP"
}

# Liga o API Gateway na Lambda: repassa a requisição inteira para o Express.
resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

# Rota "pega tudo": qualquer método e caminho vai para a Lambda.
# Quem decide as rotas (/login, /users...) é o Express.
resource "aws_apigatewayv2_route" "all" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

# Publica a API. "$default" = URL sem prefixo (sem /prod, /v1...).
# auto_deploy = qualquer mudança acima entra no ar sozinha.
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true
}

# Permite o API Gateway executar a Lambda.
resource "aws_lambda_permission" "apigateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}

# ------------------------------------------------------------
# Rotina diária: chama a Lambda uma vez por dia
# ------------------------------------------------------------

# Identidade (role) que o agendador usa para chamar a Lambda.
resource "aws_iam_role" "scheduler" {
  name = "${local.name}-scheduler"

  # Diz que só o EventBridge Scheduler pode usar esta role.
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "scheduler.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# Permite a role acima executar a nossa Lambda (e nada mais).
resource "aws_iam_role_policy" "scheduler_invoke_lambda" {
  name = "invoke-lambda"
  role = aws_iam_role.scheduler.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "lambda:InvokeFunction"
      Resource = aws_lambda_function.api.arn
    }]
  })
}

# O agendamento: todo dia no horário de São Paulo, envia { "action": "daily-routine" }.
# O src/lambda.ts reconhece esse evento e roda a rotina em vez da API.
resource "aws_scheduler_schedule" "daily_routine" {
  name                         = "${local.name}-daily-routine"
  schedule_expression          = "cron(${var.daily_routine_minute} ${var.daily_routine_hour} * * ? *)"
  schedule_expression_timezone = "America/Sao_Paulo"

  # Roda exatamente no horário (sem janela de tolerância).
  flexible_time_window {
    mode = "OFF"
  }

  target {
    arn      = aws_lambda_function.api.arn
    role_arn = aws_iam_role.scheduler.arn
    input    = jsonencode({ action = "daily-routine" })
  }
}

# ------------------------------------------------------------
# Deploy pelo GitHub Actions (sem chave/senha, via OIDC)
# ------------------------------------------------------------

# Faz a AWS confiar nos tokens que o GitHub Actions gera.
# Só pode existir um desse por conta AWS.
resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

# Role que o pipeline assume para publicar o código.
resource "aws_iam_role" "github_deploy" {
  name = "${local.name}-github-deploy"

  # Só a branch main do repositório pode usar esta role.
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.github.arn }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${local.github_repo}:*"
        }
      }
    }]
  })
}

# O pipeline só pode trocar o código desta Lambda e ver o status dela. Nada mais.
resource "aws_iam_role_policy" "github_deploy" {
  name = "update-lambda-code"
  role = aws_iam_role.github_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "lambda:UpdateFunctionCode",
        "lambda:GetFunction",
        "lambda:GetFunctionConfiguration",
      ]
      Resource = aws_lambda_function.api.arn
    }]
  })
}
