# Valores mostrados no fim do "terraform apply".
# Para ver de novo depois: "terraform output" dentro de infra/.

# Endereço público da API. É essa URL que o frontend chama.
output "api_url" {
  value = aws_apigatewayv2_stage.default.invoke_url
}

# Nome da Lambda (útil para achar ela no console da AWS).
output "lambda_function_name" {
  value = aws_lambda_function.api.function_name
}

# Copie este valor para o secret AWS_ROLE_ARN no GitHub.
output "github_deploy_role_arn" {
  value = aws_iam_role.github_deploy.arn
}
