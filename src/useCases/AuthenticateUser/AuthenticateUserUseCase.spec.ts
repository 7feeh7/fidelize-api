import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tenant, type TenantStatus } from "@/entities/Tenant";
import { User } from "@/entities/User";
import type { IHashProvider } from "@/providers/IHashProvider";
import type { ITokenProvider } from "@/providers/ITokenProvider";
import type { ITenantsRepository } from "@/repositories/ITenantsRepository";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import {
	AuthenticateUserUseCase,
	TENANT_WITHOUT_ACCESS_MESSAGE,
} from "./AuthenticateUserUseCase";

function buildUser(firstLoginAt: Date | null = null) {
	return new User(
		{
			tenantId: "tenant-1",
			role: "TENANT_ADMIN",
			name: "Maria Silva",
			email: "maria@example.com",
			password: "senha-hasheada",
			firstLoginAt,
		},
		"user-id-1",
	);
}

function buildTenant(status: TenantStatus) {
	return new Tenant({ name: "Salão", slug: "salao", status }, "tenant-1");
}

describe("AuthenticateUserUseCase", () => {
	let userRepository: IUsersRepository;
	let hashProvider: IHashProvider;
	let tokenProvider: ITokenProvider;
	let tenantsRepository: ITenantsRepository;
	let sut: AuthenticateUserUseCase;

	const credentials = {
		email: "maria@example.com",
		password: "senha-plana",
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
		tokenProvider = {
			generateAccessToken: vi.fn(),
			generateRefreshToken: vi.fn(),
			verifyAccessToken: vi.fn(),
		};
		tenantsRepository = {
			save: vi.fn(),
			findById: vi.fn().mockResolvedValue(buildTenant("ACTIVE")),
			findBySlug: vi.fn(),
			listWithAccess: vi.fn(),
		};
		sut = new AuthenticateUserUseCase(
			userRepository,
			hashProvider,
			tokenProvider,
			tenantsRepository,
		);

		vi.mocked(tokenProvider.generateAccessToken).mockReturnValue(
			jwt.sign({ sub: "user-id-1" }, "test-secret", { expiresIn: 3600 }),
		);
		vi.mocked(tokenProvider.generateRefreshToken).mockReturnValue(
			"refresh-token",
		);
	});

	it("retorna tokens com negócio e papel quando as credenciais são válidas", async () => {
		vi.mocked(userRepository.findByEmail).mockResolvedValue(buildUser());
		vi.mocked(hashProvider.compareHash).mockResolvedValue(true);

		const result = await sut.execute(credentials);

		const expectedPayload = {
			sub: "user-id-1",
			email: "maria@example.com",
			tenantId: "tenant-1",
			role: "TENANT_ADMIN",
		};

		expect(userRepository.findByEmail).toHaveBeenCalledWith(
			"maria@example.com",
		);
		expect(hashProvider.compareHash).toHaveBeenCalledWith(
			"senha-plana",
			"senha-hasheada",
		);
		expect(tokenProvider.generateAccessToken).toHaveBeenCalledWith(
			expectedPayload,
		);
		expect(tokenProvider.generateRefreshToken).toHaveBeenCalledWith(
			expectedPayload,
		);
		expect(result.refresh_token).toBe("refresh-token");
		expect(result.expires_in).toBe(3600);
		expect(result).not.toHaveProperty("user");
	});

	it("grava o primeiro login quando ainda não existe", async () => {
		vi.mocked(userRepository.findByEmail).mockResolvedValue(buildUser());
		vi.mocked(hashProvider.compareHash).mockResolvedValue(true);

		await sut.execute(credentials);

		expect(userRepository.markFirstLogin).toHaveBeenCalledWith(
			"tenant-1",
			"user-id-1",
		);
	});

	it("não grava o primeiro login de novo", async () => {
		vi.mocked(userRepository.findByEmail).mockResolvedValue(
			buildUser(new Date("2026-01-01T00:00:00.000Z")),
		);
		vi.mocked(hashProvider.compareHash).mockResolvedValue(true);

		await sut.execute(credentials);

		expect(userRepository.markFirstLogin).not.toHaveBeenCalled();
	});

	it.each<TenantStatus>(["TRIAL", "ACTIVE"])(
		"permite login de negócio %s",
		async (status) => {
			vi.mocked(userRepository.findByEmail).mockResolvedValue(buildUser());
			vi.mocked(hashProvider.compareHash).mockResolvedValue(true);
			vi.mocked(tenantsRepository.findById).mockResolvedValue(
				buildTenant(status),
			);

			await expect(sut.execute(credentials)).resolves.toBeDefined();
		},
	);

	it.each<TenantStatus>(["SUSPENDED", "CANCELED"])(
		"bloqueia login de negócio %s, sem gravar primeiro login nem gerar token",
		async (status) => {
			vi.mocked(userRepository.findByEmail).mockResolvedValue(buildUser());
			vi.mocked(hashProvider.compareHash).mockResolvedValue(true);
			vi.mocked(tenantsRepository.findById).mockResolvedValue(
				buildTenant(status),
			);

			await expect(sut.execute(credentials)).rejects.toThrow(
				TENANT_WITHOUT_ACCESS_MESSAGE,
			);

			expect(userRepository.markFirstLogin).not.toHaveBeenCalled();
			expect(tokenProvider.generateAccessToken).not.toHaveBeenCalled();
		},
	);

	it("lança erro genérico quando o e-mail não está cadastrado", async () => {
		vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

		await expect(sut.execute(credentials)).rejects.toThrow(
			"Credenciais inválidas",
		);

		expect(hashProvider.compareHash).not.toHaveBeenCalled();
		expect(tokenProvider.generateAccessToken).not.toHaveBeenCalled();
	});

	it("lança o mesmo erro genérico quando a senha está incorreta, sem revelar o status do negócio", async () => {
		vi.mocked(userRepository.findByEmail).mockResolvedValue(buildUser());
		vi.mocked(hashProvider.compareHash).mockResolvedValue(false);
		vi.mocked(tenantsRepository.findById).mockResolvedValue(
			buildTenant("SUSPENDED"),
		);

		await expect(sut.execute(credentials)).rejects.toThrow(
			"Credenciais inválidas",
		);

		expect(userRepository.markFirstLogin).not.toHaveBeenCalled();
		expect(tokenProvider.generateAccessToken).not.toHaveBeenCalled();
	});
});
