# Deploy na AWS (Lambda)

Produção usa **AWS Lambda** (`nodejs24.x`) exposta por um **API Gateway HTTP API** (HTTPS público) e **EventBridge Scheduler** para a rotina diária.

![Diagrama da pipeline](../assets/deploy.png)

## Quem faz o quê

|                                 | Terraform                                               | GitHub Actions                                                      |
| ------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| Quando roda                     | Ao criar a infra e quando ela mudar                     | A cada push na `main`                                               |
| O que faz                       | Cria/altera Lambda, API Gateway, EventBridge, IAM, logs | Lint, typecheck, testes, build, migrations, publica o zip na Lambda |
| Variáveis de ambiente da Lambda | **Sim** (vêm do `infra/terraform.tfvars`)               | Não                                                                 |
| Código da Lambda                | Só um código provisório na criação                      | **Sim** (`aws lambda update-function-code`)                         |

O Terraform ignora mudanças no código da Lambda (`lifecycle.ignore_changes` em [`infra/main.tf`](../infra/main.tf)). Rodar `terraform apply` de novo **não** desfaz o código publicado pelo GitHub.

## Estrutura

```
infra/
├── bootstrap/               # roda uma vez: bucket S3 do state
├── main.tf                  # Lambda, API Gateway, rotina diária e acesso do GitHub
├── variables.tf             # valores de entrada (banco, JWT, CORS...)
├── outputs.tf               # URL da API e ARN da role do GitHub
├── providers.tf             # conexão com a AWS (sa-east-1)
├── versions.tf              # versões do Terraform e dos plugins
├── backend.tf               # onde o state fica guardado (S3)
└── terraform.tfvars.example # modelo do terraform.tfvars
```

## Pipeline ([`.github/workflows/pipeline.yml`](../.github/workflows/pipeline.yml))

1. **ci**: `yarn lint`, `yarn typecheck`, `yarn test` (em push e PR)
2. **deploy** (só em push na `main`):
   1. `yarn build:lambda` gera `dist/lambda.zip`
   2. `yarn migrate:latest` no Supabase
   3. login na AWS via OIDC (role `fidelizei-api-github-deploy`)
   4. `aws lambda update-function-code` + espera a atualização terminar

A role do GitHub só tem permissão para atualizar o código da Lambda `fidelizei-api`.

### Secrets e variables do GitHub

**Settings → Secrets and variables → Actions**:

| Tipo     | Nome           | Valor                                        |
| -------- | -------------- | -------------------------------------------- |
| Secret   | `AWS_ROLE_ARN` | output `github_deploy_role_arn` do Terraform |
| Secret   | `DB_PASSWORD`  | senha                                        |
| Variable | `DB_HOST`      | host                                         |
| Variable | `DB_PORT`      | `6543`                                       |
| Variable | `DB_USER`      | `postgres.<project-ref>`                     |
| Variable | `DB_NAME`      | `postgres`                                   |

Os dados do banco no GitHub servem **só para as migrations**. A Lambda usa os valores do `terraform.tfvars`.

## Comandos do dia a dia

Mudar a infra ou alguma variável de ambiente da Lambda:

```bash
cd infra
terraform plan    # mostra o que vai mudar
terraform apply   # aplica
```

Publicar o código manualmente, sem o GitHub:

```bash
yarn build:lambda
aws lambda update-function-code --function-name fidelizei-api --zip-file fileb://dist/lambda.zip
```

## Desenvolvimento local

Nada muda:

1. Postgres via `docker compose up -d` (serviço `postgres`).
2. Arquivo `.env` a partir de `.env.example` (`DB_SSL` vazio ou `false` para localhost).
3. `yarn migrate:latest` e `yarn start:dev`.

A rotina diária só roda em produção via EventBridge Scheduler, que invoca a Lambda com `{ "action": "daily-routine" }` (handler em [`src/lambda.ts`](../src/lambda.ts), fora do Express). Em desenvolvimento local, dispare manualmente invocando a Lambda empacotada ou executando `runDailyRoutine` em script/teste apontando ao banco local.

## Logs (Pino)

A API usa um logger singleton ([`PinoLogger`](../src/providers/implementations/PinoLogger.ts)) com saída JSON no stdout. Na Lambda, esses logs vão para o CloudWatch.

| Contexto | Formato | Nível padrão |
| -------- | ------- | ------------ |
| Lambda / produção | JSON | `info` |
| Local com `NODE_ENV=development` | `pino-pretty` (legível no terminal) | `info` |
| Testes (`vitest`) | silenciado | `silent` (a menos que `LOG_LEVEL` esteja definido) |

Variável opcional no `.env` local: `LOG_LEVEL` (`trace`, `debug`, `info`, `warn`, `error`, `fatal`, `silent`). Na Lambda não há variável dedicada no Terraform; o padrão `info` vale.

O middleware HTTP ([`httpLogger`](../src/middlewares/httpLogger.ts)) registra, ao fim de cada requisição, `method`, `path`, `statusCode` e `durationMs`. Corpo e headers (incluindo `Authorization`) não são logados.

## Build do pacote Lambda

Requer **Docker** (para compilar o `bcrypt` no Amazon Linux 2023):

```bash
yarn build:lambda
```

Saída: `dist/lambda.zip` (handler `index.handler`).
