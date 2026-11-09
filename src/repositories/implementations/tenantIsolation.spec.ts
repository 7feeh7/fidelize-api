import type { Knex } from "knex";
import { afterAll, describe, expect, it } from "vitest";
import { Appointment } from "@/entities/Appointment";
import { AppointmentItem } from "@/entities/AppointmentItem";
import { Customer } from "@/entities/Customer";
import { CustomerReward } from "@/entities/CustomerReward";
import { LoyaltyRule } from "@/entities/LoyaltyRule";
import { Message } from "@/entities/Message";
import { MessageTemplate } from "@/entities/MessageTemplate";
import { Referral } from "@/entities/Referral";
import { Service } from "@/entities/Service";
import { User } from "@/entities/User";
import { createCaptureKnex } from "@/test/createCaptureKnex";
import { PostgresAppointmentsRepository } from "./PostgresAppointmentsRepository";
import { PostgresBirthdaysRepository } from "./PostgresBirthdaysRepository";
import { PostgresCustomerRewardsRepository } from "./PostgresCustomerRewardsRepository";
import { PostgresCustomersRepository } from "./PostgresCustomersRepository";
import { PostgresIndicatorsRepository } from "./PostgresIndicatorsRepository";
import { PostgresLoyaltyRulesRepository } from "./PostgresLoyaltyRulesRepository";
import { PostgresMessagesRepository } from "./PostgresMessagesRepository";
import { PostgresMessageTemplatesRepository } from "./PostgresMessageTemplatesRepository";
import { PostgresReferralsRepository } from "./PostgresReferralsRepository";
import { PostgresReturnRemindersRepository } from "./PostgresReturnRemindersRepository";
import { PostgresServicesRepository } from "./PostgresServicesRepository";
import { PostgresUsersRepository } from "./PostgresUsersRepository";

const TENANT = "tenant-under-test";
const NOW = new Date("2026-01-15T12:00:00.000Z");

const customer = new Customer(
	{
		name: "Cliente",
		phone: "11999990000",
		dateOfBirth: null,
		leadSource: "INSTAGRAM",
		active: true,
	},
	"customer-id",
);
const service = new Service(
	{
		name: "Corte",
		description: null,
		price: 50,
		durationMinutes: null,
		suggestedReturnDays: null,
		active: true,
	},
	"service-id",
);
const user = new User(
	{
		tenantId: TENANT,
		role: "ATTENDANT",
		name: "Usuário",
		email: "usuario@example.test",
		password: "hash",
		firstLoginAt: null,
	},
	"user-id",
);
const appointment = new Appointment(
	{
		customerId: "customer-id",
		userId: "user-id",
		appointmentDate: NOW,
		subtotal: 50,
		discountAmount: 0,
		total: 50,
		notes: null,
	},
	"appointment-id",
);
const appointmentItem = new AppointmentItem(
	{ serviceId: "other-service-id", price: 50, returnDueDate: null },
	"item-id",
);
const referral = new Referral(
	{
		referrerId: "customer-id",
		referredId: "other-customer-id",
		status: "PENDING",
		convertedAt: null,
	},
	"referral-id",
);
const loyaltyRule = new LoyaltyRule(
	{
		name: "Regra",
		description: null,
		triggerType: "FIRST_VISIT",
		visitCount: null,
		rewardType: "PERCENT_DISCOUNT",
		rewardValue: 10,
		freeServiceId: null,
		validDays: null,
		active: true,
	},
	"rule-id",
);
const customerReward = new CustomerReward(
	{
		customerId: "customer-id",
		loyaltyRuleId: "rule-id",
		referralId: null,
		appointmentId: null,
		grantYear: null,
		status: "AVAILABLE",
		grantedAt: NOW,
		expiresAt: null,
		usedAt: null,
	},
	"reward-id",
);
const messageTemplate = new MessageTemplate(
	{
		name: "Modelo",
		type: "CUSTOM",
		content: "Oi",
		active: true,
	},
	"template-id",
);
const message = new Message(
	{
		customerId: "customer-id",
		templateId: null,
		appointmentItemId: "item-id",
		customerRewardId: null,
		type: "RETURN_REMINDER",
		content: "Oi",
		status: "PENDING",
		scheduledFor: "2026-01-15",
		sentAt: null,
		sentBy: null,
		createdAt: NOW,
	},
	"message-id",
);

type RepositoryCall = (db: Knex) => Promise<unknown>;

const calls: Record<string, Record<string, RepositoryCall>> = {
	Customers: {
		save: (db) => new PostgresCustomersRepository(db).save(TENANT, customer),
		list: (db) =>
			new PostgresCustomersRepository(db).list(TENANT, {
				page: 1,
				perPage: 10,
				search: "ana",
			}),
		findByPhone: (db) =>
			new PostgresCustomersRepository(db).findByPhone(TENANT, "11999990000"),
		findActiveById: (db) =>
			new PostgresCustomersRepository(db).findActiveById(TENANT, "id"),
		findActiveProfileById: (db) =>
			new PostgresCustomersRepository(db).findActiveProfileById(TENANT, "id"),
		update: (db) =>
			new PostgresCustomersRepository(db).update(TENANT, customer),
		deactivate: (db) =>
			new PostgresCustomersRepository(db).deactivate(TENANT, "id"),
	},
	Services: {
		save: (db) => new PostgresServicesRepository(db).save(TENANT, service),
		findByName: (db) =>
			new PostgresServicesRepository(db).findByName(TENANT, "Corte"),
		findById: (db) => new PostgresServicesRepository(db).findById(TENANT, "id"),
		findActiveById: (db) =>
			new PostgresServicesRepository(db).findActiveById(TENANT, "id"),
		listAll: (db) => new PostgresServicesRepository(db).listAll(TENANT),
		update: (db) => new PostgresServicesRepository(db).update(TENANT, service),
		deactivate: (db) =>
			new PostgresServicesRepository(db).deactivate(TENANT, "id"),
	},
	Users: {
		save: (db) => new PostgresUsersRepository(db).save(user),
		update: (db) => new PostgresUsersRepository(db).update(TENANT, user),
		markFirstLogin: (db) =>
			new PostgresUsersRepository(db).markFirstLogin(TENANT, "id"),
		findById: (db) => new PostgresUsersRepository(db).findById(TENANT, "id"),
		listAll: (db) => new PostgresUsersRepository(db).listAll(TENANT),
	},
	Appointments: {
		saveWithItems: (db) =>
			new PostgresAppointmentsRepository(db).saveWithItems(
				TENANT,
				appointment,
				[appointmentItem],
			),
		updateWithItems: (db) =>
			new PostgresAppointmentsRepository(db).updateWithItems(
				TENANT,
				appointment,
				[appointmentItem],
			),
		findById: (db) =>
			new PostgresAppointmentsRepository(db).findById(TENANT, "id"),
		findDetailById: (db) =>
			new PostgresAppointmentsRepository(db).findDetailById(TENANT, "id"),
		list: (db) =>
			new PostgresAppointmentsRepository(db).list(TENANT, {
				page: 1,
				perPage: 10,
				customerId: "id",
				startDate: "2026-01-01",
				endDate: "2026-01-31",
			}),
		countByCustomerId: (db) =>
			new PostgresAppointmentsRepository(db).countByCustomerId(TENANT, "id"),
		getStatsByCustomerId: (db) =>
			new PostgresAppointmentsRepository(db).getStatsByCustomerId(TENANT, "id"),
	},
	Referrals: {
		save: (db) => new PostgresReferralsRepository(db).save(TENANT, referral),
		findByReferredId: (db) =>
			new PostgresReferralsRepository(db).findByReferredId(TENANT, "id"),
		findById: (db) =>
			new PostgresReferralsRepository(db).findById(TENANT, "id"),
		update: (db) =>
			new PostgresReferralsRepository(db).update(TENANT, referral),
		list: (db) =>
			new PostgresReferralsRepository(db).list(TENANT, {
				page: 1,
				perPage: 10,
				status: "PENDING",
				referrerId: "id",
			}),
		countByReferrerId: (db) =>
			new PostgresReferralsRepository(db).countByReferrerId(TENANT, "id"),
		convertPendingByReferredId: (db) =>
			new PostgresReferralsRepository(db).convertPendingByReferredId(
				TENANT,
				"id",
				NOW,
			),
	},
	LoyaltyRules: {
		save: (db) =>
			new PostgresLoyaltyRulesRepository(db).save(TENANT, loyaltyRule),
		findById: (db) =>
			new PostgresLoyaltyRulesRepository(db).findById(TENANT, "id"),
		listAll: (db) => new PostgresLoyaltyRulesRepository(db).listAll(TENANT),
		update: (db) =>
			new PostgresLoyaltyRulesRepository(db).update(TENANT, loyaltyRule),
		setActive: (db) =>
			new PostgresLoyaltyRulesRepository(db).setActive(TENANT, "id", false),
		listActiveByTriggerType: (db) =>
			new PostgresLoyaltyRulesRepository(db).listActiveByTriggerType(
				TENANT,
				"BIRTHDAY",
			),
	},
	CustomerRewards: {
		save: (db) =>
			new PostgresCustomerRewardsRepository(db).save(TENANT, customerReward),
		existsByGrantKey: (db) =>
			new PostgresCustomerRewardsRepository(db).existsByGrantKey(
				TENANT,
				"customer",
				"rule",
				null,
			),
		existsBirthdayGrantForYear: (db) =>
			new PostgresCustomerRewardsRepository(db).existsBirthdayGrantForYear(
				TENANT,
				"customer",
				"rule",
				2026,
			),
		findById: (db) =>
			new PostgresCustomerRewardsRepository(db).findById(TENANT, "id"),
		findDetailById: (db) =>
			new PostgresCustomerRewardsRepository(db).findDetailById(TENANT, "id"),
		findUsedDetailByAppointmentId: (db) =>
			new PostgresCustomerRewardsRepository(db).findUsedDetailByAppointmentId(
				TENANT,
				"id",
			),
		expireAvailablePastDue: (db) =>
			new PostgresCustomerRewardsRepository(db).expireAvailablePastDue(
				TENANT,
				NOW,
			),
		listByCustomerId: (db) =>
			new PostgresCustomerRewardsRepository(db).listByCustomerId(TENANT, {
				customerId: "id",
				status: "AVAILABLE",
				page: 1,
				perPage: 10,
			}),
		listAvailableExpiringWithinDays: (db) =>
			new PostgresCustomerRewardsRepository(db).listAvailableExpiringWithinDays(
				TENANT,
				"id",
				NOW,
				7,
			),
		findSoonestExpiringAvailable: (db) =>
			new PostgresCustomerRewardsRepository(db).findSoonestExpiringAvailable(
				TENANT,
				"id",
			),
		update: (db) =>
			new PostgresCustomerRewardsRepository(db).update(TENANT, customerReward),
	},
	MessageTemplates: {
		save: (db) =>
			new PostgresMessageTemplatesRepository(db).save(TENANT, messageTemplate),
		findById: (db) =>
			new PostgresMessageTemplatesRepository(db).findById(TENANT, "id"),
		findActiveAutomaticByType: (db) =>
			new PostgresMessageTemplatesRepository(db).findActiveAutomaticByType(
				TENANT,
				"BIRTHDAY",
			),
		listAll: (db) => new PostgresMessageTemplatesRepository(db).listAll(TENANT),
		update: (db) =>
			new PostgresMessageTemplatesRepository(db).update(
				TENANT,
				messageTemplate,
			),
		setActive: (db) =>
			new PostgresMessageTemplatesRepository(db).setActive(TENANT, "id", true),
		deactivateActiveByAutomaticType: (db) =>
			new PostgresMessageTemplatesRepository(
				db,
			).deactivateActiveByAutomaticType(TENANT, "BIRTHDAY", "id"),
	},
	Messages: {
		save: (db) => new PostgresMessagesRepository(db).save(TENANT, message),
		saveIgnoringAppointmentItemConflict: (db) =>
			new PostgresMessagesRepository(db).saveIgnoringAppointmentItemConflict(
				TENANT,
				message,
			),
		findById: (db) => new PostgresMessagesRepository(db).findById(TENANT, "id"),
		findListItemById: (db) =>
			new PostgresMessagesRepository(db).findListItemById(TENANT, "id"),
		list: (db) =>
			new PostgresMessagesRepository(db).list(TENANT, {
				status: "PENDING",
				customerId: "id",
				page: 1,
				perPage: 10,
			}),
		countPendingUntil: (db) =>
			new PostgresMessagesRepository(db).countPendingUntil(
				TENANT,
				"2026-01-15",
			),
		updateContent: (db) =>
			new PostgresMessagesRepository(db).updateContent(TENANT, "id", "Oi"),
		markSent: (db) =>
			new PostgresMessagesRepository(db).markSent(TENANT, "id", "user", NOW),
		cancel: (db) => new PostgresMessagesRepository(db).cancel(TENANT, "id"),
		existsBirthdayMessageForYear: (db) =>
			new PostgresMessagesRepository(db).existsBirthdayMessageForYear(
				TENANT,
				"id",
				2026,
			),
	},
	Indicators: {
		getTotals: (db) =>
			new PostgresIndicatorsRepository(db).getTotals(
				TENANT,
				"2026-01-01",
				"2026-01-31",
			),
	},
	Birthdays: {
		listCandidatesForDate: (db) =>
			new PostgresBirthdaysRepository(db).listCandidatesForDate(
				TENANT,
				"2026-02-28",
			),
		listInMonth: (db) =>
			new PostgresBirthdaysRepository(db).listInMonth(TENANT, 2026, 2),
	},
	ReturnReminders: {
		listEligibleForReminders: (db) =>
			new PostgresReturnRemindersRepository(db).listEligibleForReminders(
				TENANT,
				"2026-01-15",
				30,
			),
		listOverdueWithoutContactAfterAppointment: (db) =>
			new PostgresReturnRemindersRepository(
				db,
			).listOverdueWithoutContactAfterAppointment(TENANT, "2026-01-15", 1, 10),
		findNextSuggestedReturnDueDate: (db) =>
			new PostgresReturnRemindersRepository(db).findNextSuggestedReturnDueDate(
				TENANT,
				"id",
				"2026-01-15",
			),
	},
};

describe("isolamento por negócio nos repositórios", () => {
	const databases: Knex[] = [];

	afterAll(async () => {
		await Promise.all(databases.map((db) => db.destroy()));
	});

	for (const [repository, methods] of Object.entries(calls)) {
		describe(repository, () => {
			for (const [method, call] of Object.entries(methods)) {
				it(`${method} usa tenant_id em todas as queries`, async () => {
					const { db, captured } = createCaptureKnex();
					databases.push(db);

					await call(db);

					expect(captured.length).toBeGreaterThan(0);

					for (const query of captured) {
						expect(query.sql).toMatch(/tenant_id/);
						expect(query.bindings).toContain(TENANT);
					}
				});
			}
		});
	}

	it("o helper reprova uma query sem o filtro de negócio", async () => {
		const { db, captured } = createCaptureKnex();
		databases.push(db);

		await db("customers").where({ id: "id" }).first();

		expect(captured[0].sql).not.toMatch(/tenant_id/);
		expect(captured[0].bindings).not.toContain(TENANT);
	});

	it("findByEmail é global de propósito, para o login descobrir o negócio", async () => {
		const { db, captured } = createCaptureKnex();
		databases.push(db);

		await new PostgresUsersRepository(db).findByEmail("usuario@example.test");

		expect(captured[0].sql).not.toMatch(/tenant_id/);
	});
});
