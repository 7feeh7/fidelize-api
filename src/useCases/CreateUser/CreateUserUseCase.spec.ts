import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tenant } from "@/entities/Tenant";
import { User, type UserRole } from "@/entities/User";
import type { IHashProvider } from "@/providers/IHashProvider";
import type { ITenantsRepository } from "@/repositories/ITenantsRepository";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

describe("CreateUserUseCase", () => {
	let userRepository: IUsersRepository;
	let hashProvider: IHashProvider;
	let tenantsRepository: ITenantsRepository;
	let sut: CreateUserUseCase;

	const request = {
		name: "Maria Silva",
		email: "maria@example.com",
		password: "senha-plana",
		tenantId: "tenant-1",
		role: "TENANT_ADMIN" as UserRole,
	};

	beforeEach(() => {
		userRepository = {
			findByEmail: vi.fn(),
			save: vi.fn(),
			update: vi.fn(),
			markFirstLogin: vi.fn(),
			findById: vi.fn(),
			listAll: vi.fn(),
		};
		hashProvider = {
			generateHash: vi.fn(),
			compareHash: vi.fn(),
		};
		tenantsRepository = {
			save: vi.fn(),
			findById: vi
				.fn()
				.mockResolvedValue(
					new Tenant(
						{ name: "Salão", slug: "salao", status: "ACTIVE" },
						"tenant-1",
					),
				),
			findBySlug: vi.fn(),
			listWithAccess: vi.fn(),
		};
		sut = new CreateUserUseCase(
			userRepository,
			hashProvider,
			tenantsRepository,
		);
	});

	it("persiste novo usuário no negócio informado, com senha hasheada e papel", async () => {
		vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
		vi.mocked(hashProvider.generateHash).mockResolvedValue("senha-hasheada");

		await sut.execute(request);

		expect(tenantsRepository.findById).toHaveBeenCalledWith("tenant-1");
		expect(userRepository.findByEmail).toHaveBeenCalledWith(
			"maria@example.com",
		);
		expect(hashProvider.generateHash).toHaveBeenCalledWith("senha-plana");
		expect(userRepository.save).toHaveBeenCalledTimes(1);

		const savedUser = vi.mocked(userRepository.save).mock.calls[0]?.[0];
		expect(savedUser).toBeInstanceOf(User);
		expect(savedUser?.name).toBe("Maria Silva");
		expect(savedUser?.email).toBe("maria@example.com");
		expect(savedUser?.password).toBe("senha-hasheada");
		expect(savedUser?.tenantId).toBe("tenant-1");
		expect(savedUser?.role).toBe("TENANT_ADMIN");
		expect(savedUser?.firstLoginAt).toBeNull();
	});

	it("aceita criar PLATFORM_ADMIN, para o dono ter um usuário em cada negócio", async () => {
		vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
		vi.mocked(hashProvider.generateHash).mockResolvedValue("senha-hasheada");

		await sut.execute({ ...request, role: "PLATFORM_ADMIN" });

		const savedUser = vi.mocked(userRepository.save).mock.calls[0]?.[0];
		expect(savedUser?.role).toBe("PLATFORM_ADMIN");
	});

	it("lança erro quando o e-mail já está cadastrado", async () => {
		const existingUser = new User({
			tenantId: "tenant-2",
			role: "ATTENDANT",
			name: "Usuário existente",
			email: "maria@example.com",
			password: "hash-antigo",
			firstLoginAt: null,
		});

		vi.mocked(userRepository.findByEmail).mockResolvedValue(existingUser);

		await expect(sut.execute(request)).rejects.toThrow("O usuário já existe");

		expect(hashProvider.generateHash).not.toHaveBeenCalled();
		expect(userRepository.save).not.toHaveBeenCalled();
	});

	it("rejeita negócio inexistente", async () => {
		vi.mocked(tenantsRepository.findById).mockResolvedValue(null);

		await expect(sut.execute(request)).rejects.toThrow(
			"Negócio não encontrado",
		);

		expect(userRepository.save).not.toHaveBeenCalled();
	});

	it("rejeita requisição sem negócio", async () => {
		await expect(
			sut.execute({ ...request, tenantId: undefined as unknown as string }),
		).rejects.toThrow("Negócio não encontrado");

		expect(tenantsRepository.findById).not.toHaveBeenCalled();
		expect(userRepository.save).not.toHaveBeenCalled();
	});

	it("rejeita papel inválido", async () => {
		await expect(
			sut.execute({ ...request, role: "SUPER_USER" as UserRole }),
		).rejects.toThrow("Papel de usuário inválido");

		expect(userRepository.save).not.toHaveBeenCalled();
	});
});
