# API HTTP

## Autenticação

A API usa JWT no header `Authorization: Bearer <access_token>`.

A única rota HTTP pública além do login é `POST /login`.

### Rotas protegidas

Respostas de não autorizado seguem o padrão REST:

| Situação                         | Status | Corpo                                  |
| -------------------------------- | ------ | -------------------------------------- |
| Token ausente ou header inválido | `401`  | `{ "message": "Token não informado" }` |
| Token expirado ou inválido       | `401`  | `{ "message": "Token inválido" }`      |
