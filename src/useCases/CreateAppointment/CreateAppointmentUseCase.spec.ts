// biome-ignore-all lint/complexity/useArrowFunction: o Vitest 5 instancia o mock com new
import type { Knex } from "knex";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Customer } from "@/entities/Customer";
import { Service } from "@/entities/Service";
import { User } from "@/entities/User";
import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type { IReferralsRepository } from "@/repositories/IReferralsRepository";
import { CustomerReward } from "@/entities/CustomerReward";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import type { GrantCustomerRewardsService } from "@/services/GrantCustomerRewardsService";
import { CreateAppointmentUseCase } from "./CreateAppointmentUseCase";

vi.mock(
	"@/repositories/implementations/PostgresAppointmentsRepository",
	() => ({
		PostgresAppointmentsRepository: vi.fn(),
	}),
);
vi.mock("@/repositories/implementations/PostgresReferralsRepository", () => ({
	PostgresReferralsRepository: vi.fn(),
}));
vi.mock(
	"@/repositories/implementations/PostgresCustomerRewardsRepository",
	() => ({
		PostgresCustomerRewardsRepository: vi.fn(),
	}),
);

describe("CreateAppointmentUseCase", () => {
	let appointmentsRepository: IAppointmentsRepository;
	let customersRepository: ICustomersRepository;
	let servicesRepository: IServicesRepository;
	let usersRepository: IUsersRepository;
	let referralsRepository: IReferralsRepository;
	let customerRewardsRepository: ICustomerRewardsRepository;
	let trxCustomerRewardsRepository: ICustomerRewardsRepository;
	let connection: Knex;
	let grantCustomerRewardsService: GrantCustomerRewardsService;
	let trxAppointmentsRepository: IAppointmentsRepository;
	let trxReferralsRepository: IReferralsRepository;
	let sut: CreateAppointmentUseCase;

	const activeCustomer = new Customer(
		{
			name: "Maria",
			phone: "11999990000",
			dateOfBirth: null,
			leadSource: "INSTAGRAM",
			active: true,
		},
		"customer-id",
	);

	const activeService = new Service(
		{
			name: "Corte",
			description: null,
			price: 80,
			durationMinutes: 60,
			suggestedReturnDays: 30,
			active: true,
		},
		"service-id",
	);

	const loggedUser = new User(
		{
			name: "Profissional",
			email: "pro@salon.com",
			password: "hash",
		},
		"user-id",
	);

	beforeEach(async () => {
		appointmentsRepository = {
			saveWithItems: vi.fn(),
			updateWithItems: vi.fn(),
			findById: vi.fn(),
			findDetailById: vi.fn(),
			list: vi.fn(),
			countByCustomerId: vi.fn(),
		};
		trxAppointmentsRepository = {
			saveWithItems: vi.fn(),
			updateWithItems: vi.fn(),
			findById: vi.fn(),
			findDetailById: vi.fn(),
			list: vi.fn(),
			countByCustomerId: vi.fn().mockResolvedValue(1),
		};
		trxReferralsRepository = {
			save: vi.fn(),
			findByReferredId: vi.fn(),
			findById: vi.fn(),
			update: vi.fn(),
			list: vi.fn(),
			countByReferrerId: vi.fn(),
			convertPendingByReferredId: vi.fn().mockResolvedValue([]),
		};
		const { PostgresAppointmentsRepository } = await import(
			"@/repositories/implementations/PostgresAppointmentsRepository"
		);
		const { PostgresReferralsRepository } = await import(
			"@/repositories/implementations/PostgresReferralsRepository"
		);
		const { PostgresCustomerRewardsRepository } = await import(
			"@/repositories/implementations/PostgresCustomerRewardsRepository"
		);
		vi.mocked(PostgresAppointmentsRepository).mockImplementation(function () {
			return trxAppointmentsRepository as never;
		});
		vi.mocked(PostgresReferralsRepository).mockImplementation(function () {
			return trxReferralsRepository as never;
		});
		trxCustomerRewardsRepository = {
			save: vi.fn(),
			existsByGrantKey: vi.fn(),
			findById: vi.fn(),
			findDetailById: vi.fn(),
			findUsedDetailByAppointmentId: vi.fn(),
			expireAvailablePastDue: vi.fn(),
			listByCustomerId: vi.fn(),
			update: vi.fn(),
		};
		vi.mocked(PostgresCustomerRewardsRepository).mockImplementation(
			function () {
				return trxCustomerRewardsRepository as never;
			},
		);

		customersRepository = {
			findByPhone: vi.fn(),
			findActiveById: vi.fn(),
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
		referralsRepository = {
			save: vi.fn(),
			findByReferredId: vi.fn(),
			findById: vi.fn(),
			update: vi.fn(),
			list: vi.fn(),
			countByReferrerId: vi.fn(),
			convertPendingByReferredId: vi.fn(),
		};
		customerRewardsRepository = {
			save: vi.fn(),
			existsByGrantKey: vi.fn(),
			findById: vi.fn(),
			findDetailById: vi.fn(),
			findUsedDetailByAppointmentId: vi.fn(),
			expireAvailablePastDue: vi.fn(),
			listByCustomerId: vi.fn(),
			update: vi.fn(),
		};
		grantCustomerRewardsService = {
			grantVisitCount: vi.fn().mockResolvedValue([]),
			grantForConvertedReferrals: vi.fn().mockResolvedValue([]),
		} as unknown as GrantCustomerRewardsService;
		connection = {
			transaction: vi.fn(async (callback) => callback({} as Knex.Transaction)),
		} as unknown as Knex;
		sut = new CreateAppointmentUseCase(
			appointmentsRepository,
			customersRepository,
			servicesRepository,
			usersRepository,
			referralsRepository,
			customerRewardsRepository,
			connection,
			grantCustomerRewardsService,
		);
	});

	it("registra atendimento calculando subtotal, total e data de retorno", async () => {
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(
			activeCustomer,
		);
		vi.mocked(usersRepository.findById).mockResolvedValue(loggedUser);
		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(
			activeService,
		);

		await sut.execute({
			customerId: "customer-id",
			appointmentDate: "2026-10-17T14:30:00.000Z",
			loggedUserId: "user-id",
			discountAmount: 10,
			items: [{ serviceId: "service-id", price: 90 }],
		});

		expect(trxAppointmentsRepository.saveWithItems).toHaveBeenCalledTimes(1);

		const [appointment, items] =
			vi.mocked(trxAppointmentsRepository.saveWithItems).mock.calls[0] ?? [];

		expect(appointment?.subtotal).toBe(90);
		expect(appointment?.discountAmount).toBe(10);
		expect(appointment?.total).toBe(80);
		expect(appointment?.userId).toBe("user-id");
		expect(items?.[0]?.returnDueDate).toBe("2026-11-16");
		expect(
			trxReferralsRepository.convertPendingByReferredId,
		).toHaveBeenCalledWith(
			"customer-id",
			new Date("2026-10-17T14:30:00.000Z"),
			expect.anything(),
		);
	});

	it("não converte indicação quando não é o primeiro atendimento", async () => {
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(
			activeCustomer,
		);
		vi.mocked(usersRepository.findById).mockResolvedValue(loggedUser);
		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(
			activeService,
		);
		vi.mocked(trxAppointmentsRepository.countByCustomerId).mockResolvedValue(2);

		await sut.execute({
			customerId: "customer-id",
			appointmentDate: "2026-10-17T14:30:00.000Z",
			loggedUserId: "user-id",
			items: [{ serviceId: "service-id", price: 80 }],
		});

		expect(
			trxReferralsRepository.convertPendingByReferredId,
		).not.toHaveBeenCalled();
	});

	it("usa o usuário logado quando nenhum profissional é informado", async () => {
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(
			activeCustomer,
		);
		vi.mocked(usersRepository.findById).mockResolvedValue(loggedUser);
		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(
			activeService,
		);

		await sut.execute({
			customerId: "customer-id",
			appointmentDate: "2026-10-17T14:30:00.000Z",
			loggedUserId: "user-id",
			items: [{ serviceId: "service-id", price: 80 }],
		});

		const [appointment] =
			vi.mocked(trxAppointmentsRepository.saveWithItems).mock.calls[0] ?? [];
		expect(appointment?.userId).toBe("user-id");
	});

	it("lança erro quando o desconto é maior que o subtotal", async () => {
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(
			activeCustomer,
		);
		vi.mocked(usersRepository.findById).mockResolvedValue(loggedUser);
		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(
			activeService,
		);

		await expect(
			sut.execute({
				customerId: "customer-id",
				appointmentDate: "2026-10-17T14:30:00.000Z",
				loggedUserId: "user-id",
				discountAmount: 100,
				items: [{ serviceId: "service-id", price: 80 }],
			}),
		).rejects.toThrow("O desconto não pode ser maior que o subtotal");

		expect(connection.transaction).not.toHaveBeenCalled();
	});

	it("lança erro quando não há serviços", async () => {
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(
			activeCustomer,
		);
		vi.mocked(usersRepository.findById).mockResolvedValue(loggedUser);

		await expect(
			sut.execute({
				customerId: "customer-id",
				appointmentDate: "2026-10-17T14:30:00.000Z",
				loggedUserId: "user-id",
				items: [],
			}),
		).rejects.toThrow("Informe pelo menos um serviço");
	});

	it("aplica benefício disponível calculando o desconto", async () => {
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(
			activeCustomer,
		);
		vi.mocked(usersRepository.findById).mockResolvedValue(loggedUser);
		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(
			activeService,
		);
		vi.mocked(customerRewardsRepository.findDetailById).mockResolvedValue({
			reward: new CustomerReward(
				{
					customerId: "customer-id",
					loyaltyRuleId: "rule-id",
					referralId: null,
					appointmentId: null,
					status: "AVAILABLE",
					grantedAt: new Date("2026-10-01T12:00:00.000Z"),
					expiresAt: new Date("2026-12-01T12:00:00.000Z"),
					usedAt: null,
				},
				"reward-id",
			),
			ruleName: "Boas-vindas",
			triggerType: "FIRST_VISIT",
			visitCount: null,
			rewardType: "PERCENT_DISCOUNT",
			rewardValue: 10,
			freeServiceId: null,
			freeServiceName: null,
			validDays: 30,
		});

		await sut.execute({
			customerId: "customer-id",
			appointmentDate: "2026-10-17T14:30:00.000Z",
			loggedUserId: "user-id",
			customerRewardId: "reward-id",
			discountAmount: 9,
			items: [{ serviceId: "service-id", price: 90 }],
		});

		const [appointment] =
			vi.mocked(trxAppointmentsRepository.saveWithItems).mock.calls[0] ?? [];
		expect(appointment?.discountAmount).toBe(9);
		expect(trxCustomerRewardsRepository.update).toHaveBeenCalledTimes(1);
	});

	it("lança erro quando o cliente não está ativo", async () => {
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(null);

		await expect(
			sut.execute({
				customerId: "customer-id",
				appointmentDate: "2026-10-17T14:30:00.000Z",
				loggedUserId: "user-id",
				items: [{ serviceId: "service-id", price: 80 }],
			}),
		).rejects.toThrow("Cliente não encontrado");
	});
});
