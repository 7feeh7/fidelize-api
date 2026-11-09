import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "@/entities/User";
import type { IHashProvider } from "@/providers/IHashProvider";
import type { ITokenProvider } from "@/providers/ITokenProvider";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import { UpdateUserUseCase } from "./UpdateUserUseCase";

const TOKEN_PAYLOAD = {
	sub: "user-id-1",
	email: "maria@example.com",
	tenantId: "tenant-1",
	role: "TENANT_ADMIN" as const,
};

describe("UpdateUserUseCase", () => {
	let usersRepository: IUsersRepository;
	let tokenProvider: ITokenProvider;
	let hashProvider: IHashProvider;
	let sut: UpdateUserUseCase;

	const loggedUser = new User(
		{
			tenantId: "tenant-1",
			role: "TENANT_ADMIN",
			name: "Maria Silva",
			email: "maria@example.com",
			password: "senha-antiga",
			firstLoginAt: null,
		},
		"user-id-1",
	);

	beforeEach(() => {
		usersRepository = {
			findByEmail: vi.fn(),
			save: vi.fn(),
			findById: vi.fn(),
			listAll: vi.fn(),
			update: vi.fn(),
			markFirstLogin: vi.fn(),
		};
		tokenProvider = {
			generateAccessToken: vi.fn(),
			generateRefreshToken: vi.fn(),
			verifyAccessToken: vi.fn(),
		};
		hashProvider = {
			generateHash: vi.fn(),
			compareHash: vi.fn(),
		};
		sut = new UpdateUserUseCase(usersRepository, tokenProvider, hashProvider);
	});

	it("atualiza nome e e-mail do usuário autenticado", async () => {
		vi.mocked(tokenProvider.verifyAccessToken).mockReturnValue(TOKEN_PAYLOAD);
		vi.mocked(usersRepository.findById).mockResolvedValue(loggedUser);
		vi.mocked(usersRepository.findByEmail).mockResolvedValue(null);

		await sut.execute({
			accessToken: "access-token",
			userId: "user-id-1",
			name: "Maria Santos",
			email: "maria.santos@example.com",
		});

		expect(usersRepository.findById).toHaveBeenCalledWith(
			"tenant-1",
			"user-id-1",
		);
		expect(usersRepository.update).toHaveBeenCalledWith(
			"tenant-1",
			expect.objectContaining({
				id: "user-id-1",
				name: "Maria Santos",
				email: "maria.santos@example.com",
				password: "senha-antiga",
			}),
		);
		expect(hashProvider.generateHash).not.toHaveBeenCalled();
	});

	it("atualiza a senha quando informada", async () => {
		vi.mocked(tokenProvider.verifyAccessToken).mockReturnValue(TOKEN_PAYLOAD);
		vi.mocked(usersRepository.findById).mockResolvedValue(loggedUser);
		vi.mocked(hashProvider.generateHash).mockResolvedValue("senha-nova-hash");

		await sut.execute({
			accessToken: "access-token",
			userId: "user-id-1",
			name: "Maria Silva",
			email: "maria@example.com",
			password: "nova-senha",
		});

		expect(hashProvider.generateHash).toHaveBeenCalledWith("nova-senha");
		expect(usersRepository.update).toHaveBeenCalledWith(
			"tenant-1",
			expect.objectContaining({
				password: "senha-nova-hash",
			}),
		);
	});

	it("rejeita atualização de outro usuário", async () => {
		vi.mocked(tokenProvider.verifyAccessToken).mockReturnValue({
			...TOKEN_PAYLOAD,
			role: "PLATFORM_ADMIN",
		});

		await expect(
			sut.execute({
				accessToken: "access-token",
				userId: "user-id-2",
				name: "Outro Usuário",
				email: "outro@example.com",
			}),
		).rejects.toThrow("Você não tem permissão para atualizar este usuário");

		expect(usersRepository.findById).not.toHaveBeenCalled();
		expect(usersRepository.update).not.toHaveBeenCalled();
	});

	it("lança erro quando o e-mail já está em uso", async () => {
		const otherUser = new User(
			{
				tenantId: "tenant-2",
				role: "ATTENDANT",
				name: "João",
				email: "joao@example.com",
				password: "hash",
				firstLoginAt: null,
			},
			"user-id-2",
		);

		vi.mocked(tokenProvider.verifyAccessToken).mockReturnValue(TOKEN_PAYLOAD);
		vi.mocked(usersRepository.findById).mockResolvedValue(loggedUser);
		vi.mocked(usersRepository.findByEmail).mockResolvedValue(otherUser);

		await expect(
			sut.execute({
				accessToken: "access-token",
				userId: "user-id-1",
				name: "Maria Silva",
				email: "joao@example.com",
			}),
		).rejects.toThrow("O usuário já existe");

		expect(usersRepository.update).not.toHaveBeenCalled();
	});
});
