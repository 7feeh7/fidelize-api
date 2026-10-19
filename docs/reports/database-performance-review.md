# Revisão técnica de banco de dados e performance

Data da análise: 2026-10-19
Escopo: `fidelize-api` (Knex 3.3 + `pg` 8.23, PostgreSQL no Supabase Free via Supavisor, API em AWS Lambda `nodejs24.x`).

> Este documento é somente análise. Nenhum código, migration ou configuração foi alterado e nenhuma escrita foi feita em banco.

---

## 1. Resumo executivo

A camada de dados está, no geral, **bem preparada para Lambda**: há uma única instância do Knex criada no escopo do módulo (reaproveitada entre invocações), o pool em Lambda é `min: 0, max: 1`, o `callbackWaitsForEmptyEventLoop` está desligado e a conexão de produção usa o **Transaction pooler (porta 6543)**, que é o modo indicado para serverless. Também não há uso de recursos incompatíveis com o modo transação do Supavisor (prepared statements nomeados, `SET` de sessão, `LISTEN/NOTIFY`, advisory locks de sessão). Todas as transações usam o `trx` de forma consistente, o que evita deadlock com `pool.max = 1`.

Os problemas reais encontrados são:

1. **Integridade e operação desnecessária na edição de atendimentos (confirmado):** `updateWithItems` apaga e recria todos os `appointment_items`. Como `messages.appointment_item_id` referencia esses itens sem `ON DELETE`, editar um atendimento que já gerou lembrete de retorno falha com violação de FK (`23503`).
2. **Índices ausentes em caminhos quentes (confirmado com `EXPLAIN`):** seis padrões de consulta usados em telas e na rotina diária não têm índice utilizável (por exemplo `appointments.customer_id`, `appointment_items.appointment_id`, `referrals.referrer_id`, `messages.appointment_item_id`).
3. **Ausência de timeouts (confirmado):** o Knex espera até 60s por conexão (padrão), não há timeout de consulta, e a Lambda tem timeout de 120s enquanto o API Gateway corta em 30s. Uma consulta travada continua consumindo Lambda e conexão do pooler por até 90s depois que o cliente já recebeu erro.
4. **Endpoint público `POST /daily-routine/run` (confirmado):** qualquer pessoa pode disparar a rotina diária, que faz dezenas/centenas de consultas e escritas. Execuções concorrentes geram lembretes duplicados, pois não há restrição única.
5. **N+1 e consultas redundantes (confirmado):** a rotina diária faz 2 a 6 consultas por cliente candidato, e alguns casos de uso fazem 2x mais consultas que o necessário (prévia de mensagem, concessão manual de benefício, ações em mensagens).
6. **Listagens sem limite máximo (confirmado):** nenhum controller limita `perPage`, e `GET /messages` e `GET /customers/:id/rewards` retornam tudo quando não recebem paginação.

**Supabase Free:** o volume atual (8 MB no banco local) e a taxa de crescimento estimada estão muito abaixo dos limites de 500 MB de banco e 5 GB de egress. O risco mais relevante no plano Free é **CPU compartilhada (Nano)** sendo gasta em seq scans à medida que as tabelas crescem e **conexões presas** por falta de timeout. O limite de 200 clientes no pooler só é risco em pico de concorrência da Lambda, que hoje não tem limite configurado.

Nenhum dos itens exige troca de stack. As correções de maior retorno são: uma migration de índices, ajuste de timeouts no `knexfile.ts`, proteção da rota da rotina e correção do `updateWithItems`.

---

## 2. Metodologia

**Fontes analisadas**

- Configuração: `src/database/knexfile.ts`, `src/database/connection.ts`, `src/lambda.ts`, `src/server.ts`, `infra/main.tf`, `infra/variables.tf`, `infra/terraform.tfvars.example`, `docs/deploy.md`, `scripts/build-lambda.mjs`.
- Todas as 12 migrations em `src/database/migrations/`.
- Todos os repositórios em `src/repositories/implementations/`, jobs em `src/jobs/`, services em `src/services/`, casos de uso e controllers de listagem em `src/useCases/`.
- Consumo real no frontend (`fidelizei-frontend/src/services/*` e `components/MainMenu/index.tsx`) para identificar consultas frequentes.

**Diagnóstico no PostgreSQL local** (container `fidelize-api-postgres-1`, PostgreSQL 17.11)

- Sessão aberta com `PGOPTIONS="-c default_transaction_read_only=on"` (confirmado `default_transaction_read_only = on`).
- Apenas `SELECT`, `EXPLAIN (COSTS OFF)` sem `ANALYZE`, e consultas a `pg_stat_user_tables`, `pg_stat_user_indexes`, `pg_indexes`, `pg_constraint`, `pg_settings`, `pg_stat_activity`.
- Como o banco local tem poucas linhas (8 MB no total), o planner escolhe seq scan para qualquer consulta. Para provar se existe índice **aplicável**, os `EXPLAIN` foram executados com `SET enable_seqscan = off`: se ainda assim o plano mostra `Seq Scan`, não há índice que atenda o filtro.

**Não realizado**

- Nenhum acesso ao Supabase de produção ou uso de credenciais de produção (`infra/terraform.tfvars` não foi lido).
- Nenhuma migration, insert, update ou delete.
- Limites do Supabase Free conferidos na documentação pública em 2026-10-19 ([pricing](https://supabase.com/pricing), [compute and disk](https://supabase.com/docs/guides/platform/compute-and-disk), [pooling and limits](https://supabase.com/docs/guides/database/connecting-to-postgres/pooling-and-limits)): 500 MB de banco, 5 GB de egress, CPU compartilhada com até 0,5 GB de RAM, 60 conexões diretas, 200 clientes no pooler e pausa após 1 semana de inatividade.

**Classificação usada**

- **Confirmado:** comprovado pelo código, pelo schema ou por `EXPLAIN`.
- **Risco potencial:** comportamento possível dado o código e a infraestrutura, mas sem evidência de ocorrência (por exemplo, sem logs de produção).
- **Sugestão:** melhoria de baixo custo sem problema atual mensurável.

---

## 3. Panorama da camada de dados

| Item | Valor encontrado | Fonte |
| --- | --- | --- |
| Cliente | `knex` 3.3.0 + `pg` 8.23.1 | `package.json` |
| Instância do Knex | única, criada no import do módulo | `src/database/connection.ts` |
| Pool em Lambda | `min: 0`, `max: 1` | `src/database/knexfile.ts:23-30` |
| Pool local | padrão do Knex (`min: 2`, `max: 10`) | `src/database/knexfile.ts` |
| `acquireConnectionTimeout` | não definido (padrão 60000 ms) | `node_modules/knex/lib/client.js:253` |
| Timeout de consulta | não definido | `src/database/knexfile.ts` |
| SSL | `rejectUnauthorized: false` | `src/database/knexfile.ts:21` |
| Pooler | Supavisor, modo transação, porta 6543 | `infra/terraform.tfvars.example`, `docs/deploy.md` |
| Lambda | 512 MB, timeout 120s, sem concorrência reservada | `infra/main.tf:66-105` |
| API Gateway | HTTP API, corte em 30s | `infra/main.tf:72` (comentário) |
| Rotina diária | EventBridge invoca a Lambda direto (`{ action: "daily-routine" }`) | `infra/main.tf:187-203`, `src/lambda.ts` |

Índices existentes (confirmados em `pg_indexes`): chaves primárias de todas as tabelas, `users_email_unique`, `customers_phone_unique`, `services_name_unique`, `referrals_referred_id_unique`, `customer_rewards_unique_grant` e `messages_status_scheduled_for_idx`. O PostgreSQL **não** cria índice automaticamente para colunas de FK.

---

## 4. Problemas encontrados

### 4.1 [Alta · Confirmado] Edição de atendimento apaga e recria itens, quebrando a FK de `messages`

**Arquivos**

```67:99:src/repositories/implementations/PostgresAppointmentsRepository.ts
	async updateWithItems(
		appointment: Appointment,
		items: AppointmentItem[],
	): Promise<void> {
		await this.connection.transaction(async (trx) => {
			// ... update de appointments ...
			await trx("appointment_items")
				.where({ appointment_id: appointment.id })
				.delete();

			if (items.length > 0) {
				await trx("appointment_items").insert(
					items.map((item) => ({
						id: item.id,
						// ...
```

```12:20:src/database/migrations/20261017090000_create_messages_table.ts
		table
			.uuid("template_id")
			.nullable()
			.references("id")
			.inTable("message_templates");
		table
			.uuid("appointment_item_id")
			.nullable()
			.references("id")
			.inTable("appointment_items");
```

**Evidências**

- `pg_constraint`: `messages_appointment_item_id_foreign FOREIGN KEY (appointment_item_id) REFERENCES appointment_items(id)`, sem `ON DELETE` (ou seja, `NO ACTION`).
- `generateReturnRemindersStep` grava `appointmentItemId` em toda mensagem `RETURN_REMINDER` (`src/jobs/generateReturnRemindersStep.ts:77-89`).
- `prepareAppointmentItems` sempre cria novas entidades `AppointmentItem` com novos IDs (`src/utils/prepareAppointmentItems.ts:32-41`).

**Impacto**

- Funcional: depois que a rotina diária gera um lembrete para um item, `PATCH /appointments/:id` daquele atendimento falha com erro `23503` (violação de FK). Não foi reproduzido, pois a análise é somente leitura; no banco local ainda não há mensagens com `appointment_item_id`.
- Performance e armazenamento: toda edição gera `DELETE` + `INSERT` de todos os itens, produzindo tuplas mortas (já visíveis em `n_dead_tup` de `appointment_items`). Cada `DELETE` também obriga o PostgreSQL a verificar a FK em `messages`, e sem índice em `messages.appointment_item_id` isso é um seq scan por item apagado.
- Regra de negócio: itens recriados ganham IDs novos, então o vínculo "lembrete já enviado para este item" se perde e um novo lembrete pode ser gerado.

**Recomendação**

Atualizar os itens por diferença, preservando os IDs dos itens que permanecem, e decidir explicitamente o que acontece com mensagens de itens removidos.

```ts
async updateWithItems(appointment: Appointment, items: AppointmentItem[]) {
	await this.connection.transaction(async (trx) => {
		await trx("appointments").where({ id: appointment.id }).update({ /* ... */ });

		const existingRows = await trx("appointment_items")
			.where({ appointment_id: appointment.id })
			.select("id", "service_id");
		const existingIdByServiceId = new Map(
			existingRows.map((row) => [row.service_id, row.id]),
		);
		const keptIds: string[] = [];

		for (const item of items) {
			const existingId = existingIdByServiceId.get(item.serviceId);

			if (existingId) {
				keptIds.push(existingId);
				await trx("appointment_items")
					.where({ id: existingId })
					.update({ price: item.price, return_due_date: item.returnDueDate });
				continue;
			}

			await trx("appointment_items").insert({ id: item.id, appointment_id: appointment.id, /* ... */ });
		}

		await trx("appointment_items")
			.where({ appointment_id: appointment.id })
			.whereNotIn("id", keptIds)
			.delete();
	});
}
```

Para os itens removidos que já têm mensagem, há duas opções de schema (decisão de negócio):

- `ON DELETE SET NULL` em `messages.appointment_item_id` (o histórico da mensagem permanece, sem vínculo com o item); ou
- bloquear a remoção de item com mensagem e retornar erro amigável.

---

### 4.2 [Alta · Confirmado] Índices ausentes em consultas frequentes

Todas as consultas abaixo foram executadas com `EXPLAIN (COSTS OFF)` e `enable_seqscan = off` no banco local. O plano continuou com `Seq Scan`, o que prova que não há índice aplicável.

| # | Consulta (onde é usada) | Plano observado | Frequência |
| --- | --- | --- | --- |
| Q1 | `appointments WHERE customer_id = ?` em `countByCustomerId`, `getStatsByCustomerId`, `list({ customerId })` e no `NOT EXISTS` de lembretes | `Seq Scan on appointments` | toda criação de atendimento, todo resumo de cliente, rotina diária |
| Q2 | `appointment_items WHERE appointment_id = ?` em `findDetailById`, `updateWithItems` e join de lembretes | `Seq Scan on appointment_items` | todo detalhe/edição de atendimento, toda prévia de mensagem com cliente |
| Q3 | `messages WHERE appointment_item_id = ?` (`NOT EXISTS` da rotina e checagem de FK no `DELETE` de itens) | `Seq Scan on messages` | rotina diária e toda edição de atendimento |
| Q4 | `messages WHERE customer_id = ? ORDER BY created_at DESC` (histórico do cliente) | `Seq Scan` + `Sort` | aba de mensagens do perfil do cliente |
| Q5 | `referrals WHERE referrer_id = ? AND status <> 'CANCELED'` (subquery `referrals_made_count`) | `Seq Scan on referrals` | **uma vez por linha** de `GET /customers` e em `GET /customers/:id/summary` |
| Q6 | `customer_rewards WHERE appointment_id = ? AND status = 'USED'` (`findUsedDetailByAppointmentId`) | `Seq Scan on customer_rewards` | todo `GET` e `PATCH` de atendimento |

Também confirmado em `pg_stat_user_tables`: `customers` e `referrals` têm mais de 930 seq scans cada, mesmo com poucos dados locais, por causa da listagem de clientes e do subselect correlacionado.

**Arquivos relacionados**

- `src/repositories/implementations/PostgresAppointmentsRepository.ts:111-133`, `:220-252`
- `src/repositories/implementations/PostgresReturnRemindersRepository.ts:26-43`, `:57-63`
- `src/repositories/implementations/PostgresMessagesRepository.ts:57-59`, `:146-149`
- `src/repositories/implementations/PostgresCustomersRepository.ts:72-74`, `:128-130`
- `src/repositories/implementations/PostgresReferralsRepository.ts:124-132`
- `src/repositories/implementations/PostgresCustomerRewardsRepository.ts:142-155`

```72:74:src/repositories/implementations/PostgresCustomersRepository.ts
				this.connection.raw(
					`(select count(*)::int from referrals r where r.referrer_id = customers.id and r.status != 'CANCELED') as referrals_made_count`,
				),
```

**Impacto**

Hoje o impacto é pequeno porque as tabelas têm dezenas de linhas. O custo de cada seq scan cresce linearmente com a tabela, e em Q5 ele é multiplicado pelo tamanho da página (10 clientes por página = 10 varreduras completas de `referrals`). Em CPU compartilhada (Nano), esse é o principal fator que degrada latência com o crescimento.

**Recomendação** (uma migration, justificada pelas consultas acima)

```ts
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	// Q1 e NOT EXISTS de lembretes (customer_id + appointment_date > ?)
	await knex.raw(
		"CREATE INDEX appointments_customer_id_appointment_date_idx ON appointments (customer_id, appointment_date DESC)",
	);
	// Q2 e NOT EXISTS de lembretes (ai2.service_id = ai.service_id)
	await knex.raw(
		"CREATE INDEX appointment_items_appointment_id_service_id_idx ON appointment_items (appointment_id, service_id)",
	);
	// Q5
	await knex.raw(
		"CREATE INDEX referrals_referrer_id_idx ON referrals (referrer_id)",
	);
	// Q3: a regra de negócio já é "no máximo uma mensagem por item" (NOT EXISTS na rotina)
	await knex.raw(
		"CREATE UNIQUE INDEX messages_appointment_item_id_unique ON messages (appointment_item_id) WHERE appointment_item_id IS NOT NULL",
	);
	// Q4
	await knex.raw(
		"CREATE INDEX messages_customer_id_created_at_idx ON messages (customer_id, created_at DESC)",
	);
	// Q6
	await knex.raw(
		"CREATE INDEX customer_rewards_appointment_id_idx ON customer_rewards (appointment_id) WHERE appointment_id IS NOT NULL",
	);
}
```

Observações:

- Antes de criar o índice único Q3 em produção, conferir que não há duplicatas: `SELECT appointment_item_id, count(*) FROM messages WHERE appointment_item_id IS NOT NULL GROUP BY 1 HAVING count(*) > 1;`.
- As tabelas são pequenas, então `CREATE INDEX` comum (com lock de escrita por milissegundos) é adequado. `CREATE INDEX CONCURRENTLY` exigiria desabilitar a transação da migration e não é necessário neste volume.

**Índices que não são recomendados** (por falta de consulta que os use)

- `messages.template_id`, `messages.sent_by`, `messages.customer_reward_id`, `loyalty_rules.free_service_id`, `customer_rewards.loyalty_rule_id`, `appointments.user_id`: nenhuma consulta filtra por essas colunas e as tabelas-pai nunca sofrem `DELETE` (clientes e serviços usam desativação lógica; não há rota de exclusão para regras, modelos e usuários).
- `customer_rewards.customer_id` isolado: já é coberto pela primeira coluna de `customer_rewards_unique_grant` (confirmado em Q10: `Index Scan using customer_rewards_unique_grant`).

**Índices existentes avaliados**

- `messages_status_scheduled_for_idx`: **utilizado** (302 `idx_scan`; `countPendingUntil` faz `Index Scan`). Manter.
- `customer_rewards_unique_grant`: **utilizado** por `existsByGrantKey` (`Index Cond` com o `COALESCE`) e pelas consultas por cliente. Manter.
- Não foram encontrados índices redundantes.

---

### 4.3 [Alta · Confirmado] Ausência de timeouts de conexão e de consulta

**Arquivos**

```13:30:src/database/knexfile.ts
const config: Knex.Config = {
	client: "pg",
	connection: {
		host: process.env.DB_HOST,
		// ...
		...(isDbSslEnabled() ? { ssl: { rejectUnauthorized: false } } : {}),
	},
	...(isLambdaEnvironment()
		? {
				pool: {
					min: 0,
					max: 1,
				},
			}
		: {}),
```

```71:72:infra/main.tf
  memory_size   = 512             # MB
  timeout       = 120             # segundos (o API Gateway corta requisições HTTP em 30s; os 120s servem para a rotina diária)
```

**Evidências**

- `acquireConnectionTimeout` não definido: o Knex usa `DEFAULT_ACQUIRE_TIMEOUT = 60000` (`node_modules/knex/lib/client.js:253`).
- Sem `query_timeout`, `statement_timeout` ou `connectionTimeoutMillis` na conexão. No Postgres local, `statement_timeout = 0` e `idle_in_transaction_session_timeout = 0`.
- A mesma Lambda atende HTTP (corte de 30s no API Gateway) e a rotina diária (até 120s).

**Impacto**

- Se uma consulta travar (lock, CPU do Nano saturada, pooler lento), o cliente recebe erro do API Gateway em 30s, mas a Lambda continua executando até 120s, cobrando duração e mantendo a conexão do pooler ocupada.
- Com `pool.max = 1`, uma conexão travada bloqueia a instância inteira até o timeout.

**Recomendação**

```ts
const HTTP_QUERY_TIMEOUT_MS = 25_000;

const config: Knex.Config = {
	client: "pg",
	connection: {
		// ... host, port, user, password, database, ssl ...
		connectionTimeoutMillis: 5_000,
		query_timeout: HTTP_QUERY_TIMEOUT_MS,
		application_name: "fidelizei-api",
	},
	acquireConnectionTimeout: 10_000,
	pool: isLambdaEnvironment() ? { min: 0, max: 1 } : { min: 0, max: 10 },
	// ...
};
```

- `query_timeout` é aplicado pelo cliente `pg`, então funciona independente do pooler. Ele deve ficar abaixo de 30s para o HTTP. A rotina diária é composta por muitas consultas curtas, então o mesmo valor por consulta é suficiente.
- Como proteção no servidor, considerar `ALTER ROLE <usuario_da_api> SET statement_timeout = '25s'` no Supabase. Parâmetros de inicialização como `statement_timeout` enviados pelo cliente podem não ser repassados pelo Supavisor em modo transação; o ajuste por role é o caminho mais previsível. Validar antes em ambiente de teste.
- `application_name` permite identificar as conexões da API em `pg_stat_activity` no painel do Supabase.

---

### 4.4 [Alta · Confirmado] `POST /daily-routine/run` é público e a rotina não é idempotente sob concorrência

**Arquivos**

```53:57:src/routes.ts
router.post("/daily-routine/run", (request, response) => {
	runDailyRoutineController.handle(request, response);
});

router.use(ensureAuthenticated);
```

**Evidências**

- A rota é registrada antes de `ensureAuthenticated` e o controller não faz nenhuma validação (`src/useCases/RunDailyRoutine/RunDailyRoutineController.ts`).
- Em produção, o EventBridge **não usa essa rota**: ele invoca a Lambda direto com `{ action: "daily-routine" }`, tratado em `src/lambda.ts:17-23` antes do Express. A spec `015-seguranca-backend` deixou a rota pública supondo que o EventBridge passava por ela.
- `generateReturnRemindersStep` usa apenas `NOT EXISTS` para evitar duplicidade, e não há restrição única em `messages.appointment_item_id`. Duas execuções simultâneas leem o mesmo estado e inserem os mesmos lembretes.
- Para aniversários, a duplicidade de benefício é barrada por `customer_rewards_unique_grant`, mas a segunda execução lança erro de violação de unicidade no meio do laço e interrompe a rotina.

**Impacto**

- Consumo: cada chamada externa executa a rotina completa (dezenas a centenas de consultas e inserts) no Nano compartilhado.
- Dados: mensagens `RETURN_REMINDER` duplicadas na fila do usuário.

**Recomendação**

1. Mover a rota para depois de `router.use(ensureAuthenticated)`. Isso não afeta o EventBridge.
2. Criar o índice único parcial `messages_appointment_item_id_unique` (seção 4.2) e inserir lembretes com `onConflict().ignore()` (seção 4.5). Isso torna a rotina idempotente mesmo com duas execuções simultâneas.

---

### 4.5 [Média · Confirmado] N+1 na rotina diária

**Arquivos**

```62:93:src/jobs/generateReturnRemindersStep.ts
	for (const candidate of candidates) {
		const { variables, customerRewardId } =
			await buildVariableValuesService.buildForReturnReminder({ /* ... */ });
		// ...
		await messagesRepository.save(message);
		generatedCount += 1;
	}
```

```87:165:src/jobs/generateBirthdaysStep.ts
	for (const candidate of candidates) {
		// por regra: existsBirthdayGrantForYear + save
		// existsBirthdayMessageForYear
		// buildForBirthday -> findDetailById ou findSoonestExpiringAvailable
		// messagesRepository.save
	}
```

**Evidências (contagem de round trips)**

| Etapa | Consultas fixas | Consultas por candidato |
| --- | --- | --- |
| Lembretes de retorno | 2 (modelo ativo + candidatos) | 2 (`findSoonestExpiringAvailable` com 2 joins + `INSERT`) |
| Aniversários | 3 (modelo, regras, candidatos) | 2 por regra + 1 (`existsBirthdayMessageForYear`) + 1 (detalhe do benefício) + 1 (`INSERT`) |

Além disso, `existsBirthdayMessageForYear` usa `EXTRACT(YEAR FROM scheduled_for::date) = ?`, que não usa índice (Q7: `Seq Scan on messages`).

```198:211:src/repositories/implementations/PostgresMessagesRepository.ts
	async existsBirthdayMessageForYear(
		customerId: string,
		calendarYear: number,
	): Promise<boolean> {
		const row = await this.connection("messages")
			.where({
				customer_id: customerId,
				type: "BIRTHDAY",
			})
			.whereRaw("EXTRACT(YEAR FROM scheduled_for::date) = ?", [calendarYear])
			.first();
```

**Impacto**

O volume diário de aniversariantes é pequeno (cerca de 1/365 dos clientes). O ponto sensível são os lembretes: a janela é de 30 dias (`RETURN_REMINDER_MAX_OVERDUE_DAYS`), então a primeira execução ou uma retomada depois de dias sem rotina pode gerar centenas de candidatos, cada um com 2 round trips da Lambda até o pooler. Com 1.000 candidatos, são cerca de 2.000 round trips sequenciais, ainda dentro dos 120s, mas desperdiçando tempo de Lambda e CPU do banco.

**Recomendação**

1. Buscar o benefício mais próximo de vencer de **todos** os candidatos em uma consulta:

```ts
async findSoonestExpiringAvailableByCustomerIds(customerIds: string[]) {
	const rows = await this.buildDetailQuery()
		.distinctOn("cr.customer_id")
		.whereIn("cr.customer_id", customerIds)
		.where("cr.status", "AVAILABLE")
		.orderBy("cr.customer_id")
		.orderByRaw("cr.expires_at ASC NULLS LAST")
		.orderBy("cr.granted_at", "asc");

	return new Map(rows.map((row) => [row.customer_id as string, mapRowToListItem(row)]));
}
```

2. Inserir as mensagens em lote, ignorando conflitos (depende do índice único da seção 4.2):

```ts
await connection("messages").insert(messageRows).onConflict().ignore();
```

3. Tornar o filtro de ano sargável:

```ts
.where("scheduled_for", ">=", `${calendarYear}-01-01`)
.where("scheduled_for", "<", `${calendarYear + 1}-01-01`)
```

Com isso, a etapa de lembretes passa de `2 + 2N` para cerca de 4 consultas, independente de N.

---

### 4.6 [Média · Confirmado] Listagens sem limite máximo de `perPage` e endpoints sem paginação obrigatória

**Arquivos**

```4:10:src/useCases/ListCustomers/ListCustomersController.ts
function parsePositiveInt(value: unknown, fallback: number): number {
	const parsed = Number.parseInt(String(value ?? fallback), 10);
	if (Number.isNaN(parsed) || parsed < 1) {
		return fallback;
	}
	return parsed;
}
```

```156:160:src/repositories/implementations/PostgresMessagesRepository.ts
		if (filters.page != null && filters.perPage != null) {
			query = query
				.limit(filters.perPage)
				.offset((filters.page - 1) * filters.perPage);
		}
```

**Evidências**

- Nenhum dos 5 controllers de listagem (`ListCustomers`, `ListAppointments`, `ListReferrals`, `ListMessages`, `ListCustomerRewards`) impõe valor máximo para `perPage`. `?perPage=1000000` é aceito.
- `GET /messages` e `GET /customers/:customerId/rewards` só aplicam `LIMIT` quando recebem `page` e `perPage` (`PostgresMessagesRepository.ts:156-160`, `PostgresCustomerRewardsRepository.ts:216-218`). Sem esses parâmetros, retornam todas as linhas. Com `customerId` e sem `status`, `GET /messages` retorna o histórico completo do cliente.
- `GET /customers/birthdays` (`PostgresBirthdaysRepository.listInMonth`) não tem paginação, mas é limitado naturalmente a cerca de 1/12 dos clientes. Aceitável.
- O frontend atual sempre envia `perPage` (`fidelizei-frontend/src/services/messages.ts:22`, `customerRewards.ts:19`, `customers.ts:21`), então o risco vem de chamadas diretas à API ou de mudanças futuras no frontend.

**Impacto**

Respostas grandes aumentam o egress do Supabase (5 GB/mês no Free), a memória da Lambda (512 MB) e o tempo de serialização JSON. A listagem de mensagens faz 5 joins por linha.

**Recomendação**

Centralizar o parse com limite máximo e paginação padrão:

```ts
const MAX_PER_PAGE = 100;

export function parsePagination(query: Request["query"], defaultPerPage = 10) {
	const page = Math.max(1, Number.parseInt(String(query.page ?? 1), 10) || 1);
	const perPage = Math.min(
		MAX_PER_PAGE,
		Math.max(1, Number.parseInt(String(query.perPage ?? defaultPerPage), 10) || defaultPerPage),
	);

	return { page, perPage };
}
```

E aplicar sempre `limit/offset` em `messages.list` e `customerRewards.listByCustomerId`.

---

### 4.7 [Média · Confirmado] Consultas redundantes em casos de uso

**a) Prévia e criação de mensagem com cliente: 6 consultas onde 3 bastam**

```44:84:src/services/BuildMessageTemplateVariableValuesService.ts
		const customer = await this.customersRepository.findActiveById(customerId);
		// ...
		const appointments = await this.appointmentsRepository.list({
			page: 1,
			perPage: 1,
			customerId,
		});

		const latestAppointmentId = appointments.items[0]?.id;
		if (latestAppointmentId) {
			const detail =
				await this.appointmentsRepository.findDetailById(latestAppointmentId);
		// ...
		await this.applySoonestAvailableReward(values, customerId);
```

`appointments.list` executa um `COUNT` (descartado) e a listagem com joins de `customers` e `users`. Em seguida, `findDetailById` busca de novo o atendimento (com joins de cliente e usuário) e os itens. Só são usados `appointment_date` e o nome do primeiro serviço. O formulário de modelo chama a prévia a cada alteração do texto (com debounce de 400ms, `MessageTemplateFormDialog.tsx:132-134`).

Recomendação: um método dedicado no repositório.

```ts
async findLatestVisitByCustomerId(customerId: string) {
	return this.connection("appointments as a")
		.leftJoin("appointment_items as ai", "ai.appointment_id", "a.id")
		.leftJoin("services as s", "s.id", "ai.service_id")
		.where("a.customer_id", customerId)
		.select("a.appointment_date", "s.name as service_name")
		.orderBy("a.appointment_date", "desc")
		.orderBy("s.name", "asc")
		.first();
}
```

**b) Concessão manual de benefício lista todos os benefícios do cliente para encontrar um**

```42:45:src/useCases/GrantManualCustomerReward/GrantManualCustomerRewardUseCase.ts
		const { items } = await this.customerRewardsRepository.listByCustomerId({
			customerId,
		});
		const rewardItem = items.find((item) => item.reward.id === granted.id);
```

Executa `COUNT` com joins e busca todo o histórico, sem limite. Recomendação: `await this.customerRewardsRepository.findDetailById(granted.id)`, uma consulta por PK.

**c) Ações em mensagens fazem ler, validar, escrever e ler de novo**

`MarkMessageSentUseCase`, `UpdateMessageContentUseCase` e `CancelMessageUseCase` fazem `findById`, `UPDATE` e (nos dois primeiros) `findListItemById`. `MarkMessageSent` também busca o usuário com `SELECT *` (incluindo hash da senha), embora o token já tenha sido validado. Além das consultas extras, a sequência ler e depois escrever permite que duas abas marquem a mesma mensagem.

Recomendação: `UPDATE` condicional, que valida e escreve em uma consulta.

```ts
async markSentIfPending(id: string, sentBy: string, sentAt: Date): Promise<boolean> {
	const updated = await this.connection("messages")
		.where({ id, status: "PENDING" })
		.update({ status: "SENT", sent_at: sentAt, sent_by: sentBy });

	return updated > 0;
}
```

**d) `pendingCount` duplicado**

`ListMessagesUseCase` executa `countPendingUntil` em toda listagem (`ListMessagesUseCase.ts:47`), e o menu do frontend consulta `GET /messages/pending-count` a cada 60s (`fidelizei-frontend/src/components/MainMenu/index.tsx:18-20`). A consulta usa índice e é barata. Prioridade baixa, mas é uma consulta removível da listagem.

**e) Validação de serviços item a item**

`prepareAppointmentItems` faz um `findActiveById` por item (`src/utils/prepareAppointmentItems.ts:21-22`). Como um atendimento tem poucos itens, o impacto é baixo; um `whereIn("id", ids)` resolve em uma consulta.

---

### 4.8 [Média · Confirmado] Concessão de benefícios faz checagem e depois insert, com corrida

```139:166:src/services/GrantCustomerRewardsService.ts
		for (const record of rules) {
			const loyaltyRuleId = record.rule.id as string;
			const alreadyGranted =
				await this.customerRewardsRepository.existsByGrantKey(
					customerId,
					loyaltyRuleId,
					referralId,
				);

			if (alreadyGranted) {
				continue;
			}
			// ...
			await this.customerRewardsRepository.save(reward);
```

**Evidência:** são 2 round trips por regra, dentro das transações de `CreateAppointment` e `CreateCustomer`. Se duas requisições concorrentes passarem pela checagem, a segunda falha com violação de `customer_rewards_unique_grant`, e a transação inteira do atendimento é desfeita com erro 400.

**Recomendação:** `INSERT ... ON CONFLICT DO NOTHING RETURNING id`, que faz uma consulta por regra e não tem corrida.

```ts
async saveIfNotGranted(reward: CustomerReward): Promise<boolean> {
	const rows = await this.connection("customer_rewards")
		.insert({ /* ... */ })
		.onConflict()
		.ignore()
		.returning("id");

	return rows.length > 0;
}
```

---

### 4.9 [Média · Risco potencial] Ciclo de vida da conexão na Lambda e concorrência sem limite

**Evidências**

- A conexão é aberta na primeira consulta e mantida no pool entre invocações (`min: 0` só a destrói após o `idleTimeoutMillis` do tarn, cujo timer não roda enquanto a Lambda está congelada). Na prática, cada instância "quente" mantém 1 cliente conectado ao Supavisor enquanto existir.
- `aws_lambda_function.api` não define `reserved_concurrent_executions` (`infra/main.tf:66-105`), e o stage do API Gateway não define throttling (`infra/main.tf:137-141`).
- O limite do pooler no Free é de 200 clientes. As conexões reais com o Postgres são limitadas pelo pool size do Supavisor, então o risco é recusa de **novos clientes** em pico, não saturação do Postgres.
- Depois de um congelamento longo, o socket pode ter sido fechado pelo pooler ou por NAT. O Knex descarta conexões marcadas com erro, mas a primeira consulta após o descongelamento pode falhar antes de o evento de fechamento ser processado. Não há logs que comprovem que isso acontece; por isso é classificado como risco.

**Impacto**

Para o volume esperado (um estabelecimento, poucos usuários simultâneos) o risco é baixo. Ele só se materializa com pico de tráfego ou abuso, por exemplo chamadas em massa à rota pública da rotina (seção 4.4).

**Recomendação**

1. Limitar a concorrência para proteger o pooler, conforme a cota da conta (contas novas costumam ter limite de 10 execuções, e a AWS exige que parte delas fique sem reserva):

```hcl
resource "aws_lambda_function" "api" {
  # ...
  reserved_concurrent_executions = 10
}
```

ou, alternativamente, throttling no stage:

```hcl
resource "aws_apigatewayv2_stage" "default" {
  # ...
  default_route_settings {
    throttling_burst_limit = 20
    throttling_rate_limit  = 10
  }
}
```

2. Antes de qualquer ação sobre conexões obsoletas, monitorar no CloudWatch erros como `Connection terminated unexpectedly` e `ECONNRESET`. Se aparecerem, a correção mais simples é uma nova tentativa única no handler para esses erros, mantendo a reutilização da conexão.

---

### 4.10 [Baixa · Confirmado] `SELECT *` e colunas desnecessárias

**Ocorrências**

- `.first()` sem `select` (gera `SELECT *`) em todos os `findById`, `findByPhone`, `findByEmail`, `findActiveById`.
- `cr.*` (`PostgresCustomerRewardsRepository.ts:120`), `m.*` (`PostgresMessagesRepository.ts:86`), `a.*` (`PostgresAppointmentsRepository.ts:116`), `loyalty_rules.*` (`PostgresLoyaltyRulesRepository.ts:36`), `customers.*` (`PostgresCustomersRepository.ts:69`, `:125`), `select("*")` em `PostgresServicesRepository.listAll` e `convertPendingByReferredId`.
- `PostgresUsersRepository.findById` retorna o hash da senha para `GetMe`, `CreateAppointment`, `UpdateAppointment` e `MarkMessageSent`, que não o usam.

**Impacto:** baixo. As tabelas são estreitas (a linha média de `messages` tem 224 bytes no banco local) e a maioria das colunas é mapeada para a entidade. O ganho real está nas listagens (`customers.*` inclui `created_at`/`updated_at`, que não são usados) e em não trafegar o hash de senha sem necessidade.

**Recomendação:** listar colunas explicitamente nas consultas de listagem e em `findById` de usuários. Nas buscas por PK que alimentam a entidade completa, `SELECT *` pode permanecer.

---

### 4.11 [Baixa · Confirmado] `COUNT` separado com joins desnecessários

`list` de atendimentos, mensagens, indicações e benefícios executa duas consultas: `COUNT` e página. Nos `COUNT`:

- `appointments` faz `JOIN customers` e `LEFT JOIN users` (`PostgresAppointmentsRepository.ts:164-166`). O `JOIN customers` não altera o resultado, porque `customer_id` é `NOT NULL` com FK, mas o planner não o remove por ser `INNER JOIN`.
- `messages` reutiliza os 5 joins da listagem (`PostgresMessagesRepository.ts:136-141`). O PostgreSQL consegue remover os `LEFT JOIN` para tabelas com PK única quando nenhuma coluna é usada, mas o `JOIN customers` permanece.

**Recomendação:** montar o `COUNT` só sobre a tabela base com os mesmos filtros. Ganho pequeno; aplicar junto com outras mudanças nesses repositórios.

---

### 4.12 [Baixa · Sugestão] Busca e filtros não sargáveis em `customers`

- `whereILike(name, '%termo%')` e `whereILike(phone, '%termo%')` (`PostgresCustomersRepository.ts:49-56`) e `EXTRACT(MONTH/DAY FROM date_of_birth)` (Q11: `Seq Scan on customers`) não usam índice B-tree.
- Para uma base de clientes de um estabelecimento (centenas a poucos milhares de linhas), o seq scan em `customers` custa menos de 1 ms e não justifica índice agora.
- Quando passar de cerca de 10 mil clientes: `CREATE EXTENSION pg_trgm` e um índice GIN `gin_trgm_ops` em `name`/`phone`. Para aniversários, um índice de expressão em `(EXTRACT(MONTH FROM date_of_birth), EXTRACT(DAY FROM date_of_birth)) WHERE active`.

---

### 4.13 [Baixa · Sugestão] Índices parciais para a rotina diária

- `expireAvailablePastDue`: `WHERE status = 'AVAILABLE' AND expires_at < ?` faz seq scan em `customer_rewards`.
- `listEligibleForReminders`: o filtro de `return_due_date` é aplicado após varrer `appointment_items` (Q12).

Ambas rodam uma vez por dia. Só justificam índice (`customer_rewards (expires_at) WHERE status = 'AVAILABLE'` e `appointment_items (return_due_date) WHERE return_due_date IS NOT NULL`) quando as tabelas tiverem dezenas de milhares de linhas.

---

### 4.14 [Baixa · Sugestão] Armazenamento e modelagem

**Avaliação dos tipos:** adequados. `uuid` (16 bytes) nas PKs, `decimal(10,2)` para valores, `date` para nascimento e retorno, `timestamptz` nos timestamps, `smallint` em `grant_year`. Não há colunas JSON ou blobs.

**Duplicações intencionais (aceitáveis):**

- `messages.content` guarda o texto final, e não só a referência ao modelo. Isso é necessário, porque o texto pode ser editado e precisa refletir o que foi enviado.
- `messages.type` repete o tipo do modelo, o que evita join na listagem.
- `appointment_items.price` repete o preço do serviço, o que preserva o preço histórico.

**Crescimento estimado** (linha média de `messages` = 224 bytes medido localmente, mais cerca de 40 bytes por entrada em cada índice):

| Tabela | Bytes por linha com índices (estimado) | Linhas para 100 MB |
| --- | --- | --- |
| `messages` (com os 2 índices novos) | ~400 | ~250 mil |
| `appointments` + `appointment_items` (2 itens) | ~450 | ~220 mil atendimentos |
| `customer_rewards` | ~250 | ~400 mil |

Para um estabelecimento com cerca de 30 atendimentos e 30 mensagens por dia, o crescimento fica em torno de 10 MB por ano. O limite de 500 MB do Free não é um risco no horizonte previsível. Observação: os schemas internos do Supabase (`auth`, `storage` etc.) também contam no tamanho; conferir o valor real no painel.

**Pontos de atenção:**

- Não há política de retenção para `messages` com status `SENT`/`CANCELED`. Não é necessária agora; reavaliar se o banco passar de 250 MB.
- `status`, `type`, `lead_source`, `trigger_type` e `reward_type` são `varchar` sem `CHECK`. Não afeta espaço de forma relevante, mas um `CHECK` protege a integridade sem custo de performance.
- O `DELETE` + `INSERT` de itens (seção 4.1) é a única fonte de churn de tuplas identificada.

---

### 4.15 [Baixa · Sugestão] Outros pontos de configuração

- **Transação aninhada:** `UpdateAppointmentUseCase` abre uma transação e chama `updateWithItems`, que abre outra sobre o `trx` (`PostgresAppointmentsRepository.ts:71`). O Knex transforma isso em `SAVEPOINT`/`RELEASE`, o que custa 2 round trips extras por edição. Permitir que `updateWithItems` receba o `trx` opcional, como já faz `saveWithItems`.
- **`Promise.all` com `pool.max = 1`:** em `GetCustomerSummaryUseCase.ts:38-50`, as 3 consultas são serializadas na Lambda. Não há erro nem deadlock (nenhuma está dentro de transação), mas também não há ganho de paralelismo. Pode ficar como está.
- **Pool local:** fora da Lambda vale o padrão do Knex (`min: 2`). A própria documentação do Knex recomenda `min: 0` para que conexões ociosas sejam liberadas.
- **SSL:** `rejectUnauthorized: false` desativa a validação do certificado. Fora do escopo de performance, mas o Supabase fornece o certificado CA para uso com `ssl: { ca }`.
- **Migrations pelo pooler em modo transação:** funcionam com o Knex (o lock é feito por tabela `knex_migrations_lock`, não por advisory lock). Se no futuro for preciso `CREATE INDEX CONCURRENTLY`, usar a porta de sessão (5432) ou conexão direta.

---

## 5. Pontos verificados sem problema

| Verificação | Resultado |
| --- | --- |
| Reutilização de conexão entre invocações | OK: instância única do Knex no escopo do módulo (`connection.ts`) |
| Event loop na Lambda | OK: `callbackWaitsForEmptyEventLoop = false` (`lambda.ts:15`) |
| Pool em Lambda | OK: `max: 1` evita várias conexões por instância |
| Deadlock com `pool.max = 1` | OK: dentro de `transaction(...)`, todos os repositórios usam o `trx` (`CreateAppointment`, `CreateCustomer`, `CreateReferral`, `UpdateAppointment`) |
| Compatibilidade com Supavisor em modo transação | OK: sem prepared statements nomeados, `SET` de sessão, `LISTEN/NOTIFY` ou advisory locks |
| Autenticação | OK: `ensureAuthenticated` valida JWT sem consultar o banco |
| Bundle | OK: drivers opcionais do Knex marcados como `external` no esbuild |
| Listagem de pendentes | OK: `countPendingUntil` usa `messages_status_scheduled_for_idx` |
| Consultas de benefícios por cliente | OK: usam `customer_rewards_unique_grant` |
| Polling do frontend | OK: 1 consulta indexada por minuto por aba visível (`refetchIntervalInBackground: false`) |
| Pausa por inatividade do Free | A rotina diária garante atividade diária no banco |

---

## 6. Impacto estimado das melhorias

Estimativa qualitativa, considerando o volume atual e o crescimento esperado para um estabelecimento.

| Melhoria | Desempenho | Conexões | Consumo do Supabase |
| --- | --- | --- | --- |
| Atualização de itens por diferença (4.1) | Médio na edição de atendimento | Neutro | Menos churn e menos tuplas mortas |
| Migration de índices (4.2) | Alto com o crescimento; baixo hoje | Conexões liberadas mais rápido | Menos CPU no Nano |
| Timeouts (4.3) | Neutro no caso normal | Alto: evita conexões presas por até 120s | Evita CPU gasta em consultas abandonadas |
| Proteger a rotina e torná-la idempotente (4.4) | Neutro | Médio | Alto: elimina execuções externas e duplicatas |
| Rotina diária em lote (4.5) | Alto na rotina (de `2N` para ~4 consultas) | Conexão ocupada por menos tempo | Médio |
| Limite de paginação (4.6) | Médio | Neutro | Médio em egress |
| Consultas redundantes (4.7) | Médio em prévia e ações de mensagem | Baixo | Baixo |
| `ON CONFLICT` em concessões (4.8) | Baixo | Neutro | Baixo; elimina erros de corrida |
| Concorrência reservada ou throttling (4.9) | Neutro | Alto em pico | Protege o limite de 200 clientes |
| Itens de prioridade baixa (4.10 a 4.15) | Baixo | Neutro | Baixo |

---

## 7. Priorização

**Alta**

1. Corrigir `updateWithItems` para atualizar por diferença e definir o comportamento da FK `messages.appointment_item_id` (4.1).
2. Criar a migration de índices: `appointments(customer_id, appointment_date DESC)`, `appointment_items(appointment_id, service_id)`, `referrals(referrer_id)`, `messages(appointment_item_id)` único parcial, `messages(customer_id, created_at DESC)` e `customer_rewards(appointment_id)` parcial (4.2).
3. Configurar `acquireConnectionTimeout`, `connectionTimeoutMillis` e `query_timeout`, e avaliar `statement_timeout` por role (4.3).
4. Mover `POST /daily-routine/run` para depois de `ensureAuthenticated` (4.4).

**Média**

5. Rotina diária em lote, com `insert` em massa e `onConflict().ignore()` (4.5).
6. `perPage` máximo e paginação obrigatória em `/messages` e `/customers/:id/rewards` (4.6).
7. Remover consultas redundantes: prévia de mensagem, concessão manual, `UPDATE` condicional em mensagens (4.7).
8. `INSERT ... ON CONFLICT DO NOTHING` na concessão de benefícios (4.8).
9. Concorrência reservada ou throttling no API Gateway, e monitoramento de erros de conexão (4.9).

**Baixa**

10. Colunas explícitas nas listagens e em `findById` de usuários (4.10).
11. `COUNT` só sobre a tabela base (4.11).
12. `pg_trgm` e índices de expressão em `customers` quando a base crescer (4.12).
13. Índices parciais da rotina diária quando as tabelas crescerem (4.13).
14. `CHECK` nos campos de status e tipo; política de retenção de mensagens, se necessário (4.14).
15. Remover a transação aninhada, `pool.min: 0` local e CA do Supabase no SSL (4.15).

---

## 8. Checklist de ações recomendadas

- [ ] Reescrever `PostgresAppointmentsRepository.updateWithItems` para atualizar por diferença e aceitar `trx` opcional.
- [ ] Decidir e aplicar a regra da FK `messages.appointment_item_id` (`ON DELETE SET NULL` ou bloqueio).
- [ ] Verificar duplicatas de `messages.appointment_item_id` em produção antes de criar o índice único.
- [ ] Criar a migration com os 6 índices da seção 4.2.
- [ ] Adicionar `acquireConnectionTimeout`, `connectionTimeoutMillis`, `query_timeout` e `application_name` no `knexfile.ts`.
- [ ] Avaliar `ALTER ROLE ... SET statement_timeout` no Supabase.
- [ ] Mover `POST /daily-routine/run` para depois de `router.use(ensureAuthenticated)` e atualizar `docs/api.md`.
- [ ] Reescrever `generateReturnRemindersStep` com busca de benefícios em lote e `insert` em massa com `onConflict().ignore()`.
- [ ] Trocar `EXTRACT(YEAR ...)` por intervalo de datas em `existsBirthdayMessageForYear`.
- [ ] Criar o parse de paginação com `MAX_PER_PAGE` e usá-lo nos 5 controllers de listagem.
- [ ] Tornar a paginação obrigatória em `messages.list` e `customerRewards.listByCustomerId`.
- [ ] Criar `findLatestVisitByCustomerId` e usá-lo em `BuildMessageTemplateVariableValuesService.execute`.
- [ ] Trocar `listByCustomerId` por `findDetailById` em `GrantManualCustomerRewardUseCase`.
- [ ] Trocar ler e depois escrever por `UPDATE ... WHERE status = 'PENDING'` em `MarkMessageSent`, `UpdateMessageContent` e `CancelMessage`.
- [ ] Trocar `existsByGrantKey` + `save` por `insert().onConflict().ignore().returning("id")`.
- [ ] Definir `reserved_concurrent_executions` ou throttling no stage do API Gateway, conforme a cota da conta.
- [ ] Criar filtro de métrica no CloudWatch para `Connection terminated unexpectedly` e `ECONNRESET`.
- [ ] Listar colunas explicitamente em `PostgresUsersRepository.findById` e nas listagens.
- [ ] Reavaliar índices trigram e parciais quando `customers` passar de cerca de 10 mil linhas ou `appointment_items`/`customer_rewards` de dezenas de milhares.
- [ ] Acompanhar o tamanho do banco e o egress no painel do Supabase mensalmente.

---

## 9. Tabela resumida

| Problema | Prioridade | Impacto | Solução recomendada |
| --- | --- | --- | --- |
| `updateWithItems` apaga e recria itens; FK de `messages` faz a edição falhar | Alta | Edição de atendimento quebra após lembrete; churn de tuplas | Atualizar por diferença e definir `ON DELETE` da FK |
| Índices ausentes em `appointments.customer_id`, `appointment_items.appointment_id`, `referrals.referrer_id`, `messages.appointment_item_id`, `messages.customer_id`, `customer_rewards.appointment_id` | Alta | Seq scans que crescem com os dados; CPU do Nano | Migration com 6 índices justificados por `EXPLAIN` |
| Sem timeout de aquisição, conexão e consulta | Alta | Conexões e Lambda presas por até 120s | `acquireConnectionTimeout`, `connectionTimeoutMillis`, `query_timeout`, `statement_timeout` por role |
| `POST /daily-routine/run` público e rotina não idempotente | Alta | Execuções externas e lembretes duplicados | Proteger com `ensureAuthenticated` e índice único em `messages.appointment_item_id` |
| N+1 na rotina diária | Média | `2N` a `6N` round trips por execução | Busca de benefícios em lote e insert em massa |
| `perPage` sem limite e listagens sem paginação obrigatória | Média | Respostas grandes; egress e memória | `MAX_PER_PAGE` e `limit` sempre aplicado |
| Consultas redundantes (prévia, concessão manual, ações em mensagens) | Média | 2x consultas por requisição | Consultas dedicadas e `UPDATE` condicional |
| Checagem e depois insert na concessão de benefícios | Média | Round trips extras e erro em corrida | `INSERT ... ON CONFLICT DO NOTHING` |
| Concorrência da Lambda sem limite e conexão possivelmente obsoleta | Média | Risco ao limite de 200 clientes do pooler em pico | Concorrência reservada ou throttling; monitorar erros |
| `SELECT *` e hash de senha trafegado | Baixa | Pequeno volume extra | Colunas explícitas |
| `COUNT` com joins desnecessários | Baixa | Pequeno custo extra por listagem | `COUNT` na tabela base |
| `ILIKE '%termo%'` e `EXTRACT` em `customers` | Baixa | Seq scan barato no volume atual | `pg_trgm` e índice de expressão quando crescer |
| Rotina diária sem índices parciais | Baixa | Seq scan 1x por dia | Índices parciais quando crescer |
| Status sem `CHECK` e sem retenção de mensagens | Baixa | Integridade; crescimento de cerca de 10 MB por ano | `CHECK` e retenção futura |
| Transação aninhada, pool local `min: 2`, SSL sem CA | Baixa | Round trips extras; conexões ociosas locais | Passar `trx`, `min: 0`, `ssl.ca` |
