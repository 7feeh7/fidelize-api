# fidelizei-api

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Fidelizei** é um projeto Node.js seguindo a arquitetura multi-tenant que permite aos usuários gerenciar clientes, atendimentos, serviços e programas de fidelidade.
visando fidelizar clientes e conquistar novos.

## Tecnologias

<p>
  <a href="https://nodejs.org/en/" target="_blank"><img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
  <a href="https://expressjs.com/pt-br/" target="_blank"><img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" alt="Express" /></a>
  <a href="https://getpino.io/" target="_blank"><img src="https://img.shields.io/badge/Pino-687634?style=flat-square&logo=pino&logoColor=white" alt="Pino" /></a>
  <a href="https://knexjs.org/" target="_blank"><img src="https://img.shields.io/badge/Knex-D26B38?style=flat-square&logo=knexdotjs&logoColor=white" alt="Knex" /></a>
  <a href="https://www.postgresql.org/" target="_blank"><img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="https://vitest.dev/" target="_blank"><img src="https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest" /></a>
  <a href="https://biomejs.dev/pt-br/" target="_blank"><img src="https://img.shields.io/badge/Biome-60A5FA?style=flat-square&logo=biome&logoColor=white" alt="Biome" /></a>
  <a href="https://developer.hashicorp.com/terraform" target="_blank"><img src="https://img.shields.io/badge/Terraform-7B42BC?style=flat-square&logo=terraform&logoColor=white" alt="Terraform" /></a>
</p>

## Arquitetura

Abaixo, um diagrama simplificado:

![Diagrama de arquitetura](assets/arquitetura.png)

## Instalação

> OBS: E NECESSARIO CONFIGURAR O ARQUIVO .ENV

1. Clonar o repositório:

   ```bash
   git clone https://github.com/7feeh7/fidelize-api.git
   ```

2. Instalando as dependências:

   ```bash
   yarn install
   ```

3. Configurar banco de dados:

- Crie um banco de dados PostgreSQL para aplicação
- Renomeie o arquivo .env.example para .env e atualize os detalhes da conexão do banco de dados

4. Inicie o servidor:

   ```bash
   yarn run start:dev
   ```

Ou usando Docker

Subir a aplicação:

```bash
docker compose up -d --build
```

Para parar os containers preservando os dados:

```bash
docker compose down
```

O servidor agora deve estar em execução em http://localhost:3000 (porta definida em `PORT` no `.env`, padrão `3000` no código).

## Diagrama de Entidade-Relacionamento

![Diagrama de Entidade-Relacionamento](assets/der.png)

## Pipeline CI/CD

![Diagrama da pipeline](assets/deploy.png)

## Documentação

- [API HTTP e autenticação](docs/api.md)
- [Banco de dados](docs/database.md)
- [Deploy na AWS (Lambda + Terraform)](docs/deploy.md)

## Contribuindo

Contribuições para o projeto são bem vindas! Pra contribuir com o projeto, siga estas etapas:

1. De um fork no repositorio.
2. Crie uma nova branch para sua feature ou bug fix.
3. Faça suas alterações, confirmando e pressionando conforme necessário.
4. Envie uma solicitação pull com uma descrição detalhada de suas alterações.

## Contato

Para qualquer dúvida ou consulta, entre em contato com [F-softtech](mailto:felipe.pires.soaresti@gmail.com).

Sinta-se à vontade para entrar em contato conosco se tiver algum comentário, sugestão ou se encontrar algum problema ao usar o fidelize-api. Sua opinião é valiosa para nós e nos ajuda a melhorar a aplicação.
