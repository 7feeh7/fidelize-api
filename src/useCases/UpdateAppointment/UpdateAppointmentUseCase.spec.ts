// biome-ignore-all lint/complexity/useArrowFunction: o Vitest 5 instancia o mock com new
import type { Knex } from "knex";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Appointment } from "@/entities/Appointment";
import { Customer } from "@/entities/Customer";
import { CustomerReward } from "@/entities/CustomerReward";
import { Service } from "@/entities/Service";
import { User } from "@/entities/User";
import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import { PostgresAppointmentsRepository } from "@/repositories/implementations/PostgresAppointmentsRepository";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { UpdateAppointmentUseCase } from "./UpdateAppointmentUseCase";

vi.mock(
	"@/repositories/implementations/PostgresAppointmentsRepository",
	() => ({
		PostgresAppointmentsRepository: vi.fn(),
	}),
);
vi.mock(
	"@/repositories/implementations/PostgresCustomerRewardsRepository",
	() => ({
		PostgresCustomerRewardsRepository: vi.fn(),
	}),
);

describe("UpdateAppointmentUseCase", () => {
	let appointmentsRepository: IAppointmentsRepository;
	let customersRepository: ICustomersRepository;
	let servicesRepository: IServicesRepository;
	let usersRepository: IUsersRepository;
	let customerRewardsRepository: ICustomerRewardsRepository;
	let trxAppointmentsRepository: IAppointmentsRepository;
	let trxCustomerRewardsRepository: ICustomerRewardsRepository;
	let connection: Knex;
	let sut: UpdateAppointmentUseCase;

	beforeEach(() => {
		appointmentsRepository = {
			saveWithItems: vi.fn(),
			updateWithItems: vi.fn(),
			findById: vi.fn(),
			findDetailById: vi.fn(),
			list: vi.fn(),
			countByCustomerId: vi.fn(),
			getStatsByCustomerId: vi.fn(),
		};
		trxAppointmentsRepository = {
			saveWithItems: vi.fn(),
			updateWithItems: vi.fn(),
			findById: vi.fn(),
			findDetailById: vi.fn(),
			list: vi.fn(),
			countByCustomerId: vi.fn(),
			getStatsByCustomerId: vi.fn(),
		};
		trxCustomerRewardsRepository = {
			save: vi.fn(),
			existsByGrantKey: vi.fn(),
			existsBirthdayGrantForYear: vi.fn(),
			listAvailableExpiringWithinDays: vi.fn(),
			findSoonestExpiringAvailable: vi.fn(),
			findById: vi.fn(),
			findDetailById: vi.fn(),
			findUsedDetailByAppointmentId: vi.fn(),
			expireAvailablePastDue: vi.fn(),
			listByCustomerId: vi.fn(),
			update: vi.fn(),
		};
		vi.mocked(PostgresAppointmentsRepository).mockImplementation(function () {
			return trxAppointmentsRepository as never;
		});
		vi.mocked(PostgresCustomerRewardsRepository).mockImplementation(
			function () {
				return trxCustomerRewardsRepository as never;
			},
		);

		customersRepository = {
			findByPhone: vi.fn(),
			findActiveById: vi.fn(),
			findActiveProfileById: vi.fn(),
			save: vi.fn(),
			list: vi.fn(),
			update: vi.fn(),
			deactivate: vi.fn(),
		};
		servicesRepository = {
			save: vi.fn(),
			findByName: vi.fn(),
			findActiveById: vi.fn(),
			listAll: vi.fn(),
			deactivate: vi.fn(),
		};
		usersRepository = {
			save: vi.fn(),
			findByEmail: vi.fn(),
			findById: vi.fn(),
			listAll: vi.fn(),
		};
		customerRewardsRepository = {
			save: vi.fn(),
			existsByGrantKey: vi.fn(),
			existsBirthdayGrantForYear: vi.fn(),
			listAvailableExpiringWithinDays: vi.fn(),
			findSoonestExpiringAvailable: vi.fn(),
			findById: vi.fn(),
			findDetailById: vi.fn(),
			findUsedDetailByAppointmentId: vi.fn(),
			expireAvailablePastDue: vi.fn(),
			listByCustomerId: vi.fn(),
			update: vi.fn(),
		};
		connection = {
			transaction: vi.fn(async (callback) => callback({} as Knex.Transaction)),
		} as unknown as Knex;
		sut = new UpdateAppointmentUseCase(
			appointmentsRepository,
			customersRepository,
			servicesRepository,
			usersRepository,
			customerRewardsRepository,
			connection,
		);
	});

	it("atualiza atendimento recalculando valores e datas de retorno", async () => {
		const existing = new Appointment(
			{
				customerId: "customer-id",
				userId: "user-id",
				appointmentDate: new Date("2026-10-01T10:00:00.000Z"),
				subtotal: 50,
				discountAmount: 0,
				total: 50,
				notes: null,
			},
			"appointment-id",
		);

		vi.mocked(appointmentsRepository.findById).mockResolvedValue(existing);
		vi.mocked(
			customerRewardsRepository.findUsedDetailByAppointmentId,
		).mockResolvedValue(null);
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(
			new Customer(
				{
					name: "Maria",
					phone: "11999990000",
					dateOfBirth: null,
					leadSource: "INSTAGRAM",
					active: true,
				},
				"customer-id",
			),
		);
		vi.mocked(usersRepository.findById).mockResolvedValue(
			new User({ name: "Pro", email: "a@b.com", password: "hash" }, "user-id"),
		);
		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(
			new Service(
				{
					name: "Escova",
					description: null,
					price: 70,
					durationMinutes: null,
					suggestedReturnDays: 15,
					active: true,
				},
				"service-id",
			),
		);

		await sut.execute({
			id: "appointment-id",
			customerId: "customer-id",
			appointmentDate: "2026-10-20T15:00:00.000Z",
			loggedUserId: "user-id",
			discountAmount: 5,
			items: [{ serviceId: "service-id", price: 75 }],
		});

		expect(trxAppointmentsRepository.updateWithItems).toHaveBeenCalledTimes(1);

		const [appointment, items] =
			vi.mocked(trxAppointmentsRepository.updateWithItems).mock.calls[0] ?? [];

		expect(appointment?.subtotal).toBe(75);
		expect(appointment?.total).toBe(70);
		expect(items?.[0]?.returnDueDate).toBe("2026-11-04");
	});

	it("libera benefício removido do atendimento", async () => {
		const existing = new Appointment(
			{
				customerId: "customer-id",
				userId: "user-id",
				appointmentDate: new Date("2026-10-01T10:00:00.000Z"),
				subtotal: 80,
				discountAmount: 8,
				total: 72,
				notes: null,
			},
			"appointment-id",
		);
		const usedReward = new CustomerReward(
			{
				customerId: "customer-id",
				loyaltyRuleId: "rule-id",
				referralId: null,
				appointmentId: "appointment-id",
				grantYear: null,
				status: "USED",
				grantedAt: new Date("2026-10-01T12:00:00.000Z"),
				expiresAt: new Date("2026-12-01T12:00:00.000Z"),
				usedAt: new Date("2026-10-01T10:00:00.000Z"),
			},
			"reward-id",
		);

		vi.mocked(appointmentsRepository.findById).mockResolvedValue(existing);
		vi.mocked(
			customerRewardsRepository.findUsedDetailByAppointmentId,
		).mockResolvedValue({
			reward: usedReward,
			ruleName: "Boas-vindas",
			triggerType: "FIRST_VISIT",
			visitCount: null,
			rewardType: "PERCENT_DISCOUNT",
			rewardValue: 10,
			freeServiceId: null,
			freeServiceName: null,
			validDays: 30,
		});
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(
			new Customer(
				{
					name: "Maria",
					phone: "11999990000",
					dateOfBirth: null,
					leadSource: "INSTAGRAM",
					active: true,
				},
				"customer-id",
			),
		);
		vi.mocked(usersRepository.findById).mockResolvedValue(
			new User({ name: "Pro", email: "a@b.com", password: "hash" }, "user-id"),
		);
		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(
			new Service(
				{
					name: "Escova",
					description: null,
					price: 70,
					durationMinutes: null,
					suggestedReturnDays: 15,
					active: true,
				},
				"service-id",
			),
		);

		await sut.execute({
			id: "appointment-id",
			customerId: "customer-id",
			appointmentDate: "2026-10-20T15:00:00.000Z",
			loggedUserId: "user-id",
			discountAmount: 0,
			items: [{ serviceId: "service-id", price: 75 }],
		});

		expect(trxCustomerRewardsRepository.update).toHaveBeenCalledTimes(1);
		expect(usedReward.status).toBe("AVAILABLE");
		expect(usedReward.appointmentId).toBeNull();
	});

	it("lança erro quando o atendimento não existe", async () => {
		vi.mocked(appointmentsRepository.findById).mockResolvedValue(null);

		await expect(
			sut.execute({
				id: "missing",
				customerId: "customer-id",
				appointmentDate: "2026-10-20T15:00:00.000Z",
				loggedUserId: "user-id",
				items: [{ serviceId: "service-id", price: 75 }],
			}),
		).rejects.toThrow("Atendimento não encontrado");
	});
});
