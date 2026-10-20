# Banco de dados

A aplicação usa PostgreSQL com [Knex](https://knexjs.org/) como query builder.

## Migrations

As migrations ficam em `src/database/migrations/`.

| Comando                    | Descrição                             |
| -------------------------- | ------------------------------------- |
| `yarn migrate:make <nome>` | Cria uma nova migration               |
| `yarn migrate:latest`      | Executa as migrations pendentes       |
| `yarn migrate:rollback`    | Desfaz o último lote de migrations    |
| `yarn knex <comando>`      | Executa qualquer outro comando do CLI |

## Tabelas principais

| Tabela              | Descrição resumida                                                              |
| ------------------- | ------------------------------------------------------------------------------- |
| `referrals`         | Indicações entre clientes (`PENDING`, `CONVERTED`, `CANCELED`)                  |
| `loyalty_rules`     | Regras de fidelidade (gatilho, recompensa, validade, status)                    |
| `customer_rewards`  | Benefícios concedidos aos clientes (status, validade, origem)                   |
| `message_templates` | Modelos de mensagem com variáveis (`RETURN_REMINDER`, `BIRTHDAY`, etc.)         |
| `messages`          | Fila de mensagens (`PENDING`, `SENT`, `CANCELED`) com texto final e agendamento |

## Variáveis de ambiente

| Variável      | Descrição                                                            |
| ------------- | -------------------------------------------------------------------- |
| `DB_HOST`     | Host do PostgreSQL                                                   |
| `DB_PORT`     | Porta do PostgreSQL                                                  |
| `DB_USER`     | Usuário                                                              |
| `DB_PASSWORD` | Senha                                                                |
| `DB_NAME`     | Nome do banco                                                        |
| `DB_SSL`      | `true`/`1` para SSL (Postgres gerenciado); omita ou `false` em local |

## Timeouts (Knex / `pg`)

A configuração em `src/database/knexfile.ts` define:

| Parâmetro                  | Valor           | Efeito                                                                       |
| -------------------------- | --------------- | ---------------------------------------------------------------------------- |
| `connectionTimeoutMillis`  | 5 s             | Limite para abrir conexão TCP com o Postgres                                 |
| `acquireConnectionTimeout` | 10 s            | Limite para obter conexão do pool do Knex                                    |
| `query_timeout`            | 25 s            | Limite por consulta no cliente `pg` (abaixo do corte de 30 s do API Gateway) |
| `application_name`         | `fidelizei-api` | Identificação em `pg_stat_activity`                                          |
