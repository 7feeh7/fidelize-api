import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "@/entities/User";
import type { ITokenProvider } from "@/providers/ITokenProvider";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import { GetMeUseCase } from "./GetMeUseCase";

describe("GetMeUseCase", () => {
	let usersRepository: IUsersRepository;
	let tokenProvider: ITokenProvider;
	let sut: GetMeUseCase;

	beforeEach(() => {
		usersRepository = {
			findByEmail: vi.fn(),
			save: vi.fn(),
			findById: vi.fn(),
			listAll: vi.fn(),
		};
		tokenProvider = {
			generateAccessToken: vi.fn(),
			generateRefreshToken: vi.fn(),
			verifyAccessToken: vi.fn(),
		};
		sut = new GetMeUseCase(usersRepository, tokenProvider);
	});

	it("retorna nome e e-mail do usuário autenticado", async () => {
		const user = new User(
			{
				name: "Maria Silva",
				email: "maria@example.com",
				password: "senha-hasheada",
			},
			"user-id-1",
		);

		vi.mocked(tokenProvider.verifyAccessToken).mockReturnValue({
			sub: "user-id-1",
			email: "maria@example.com",
		});
		vi.mocked(usersRepository.findById).mockResolvedValue(user);

		const result = await sut.execute("access-token");

		expect(tokenProvider.verifyAccessToken).toHaveBeenCalledWith(
			"access-token",
		);
		expect(usersRepository.findById).toHaveBeenCalledWith("user-id-1");
		expect(result).toEqual({
			id: "user-id-1",
			name: "Maria Silva",
			email: "maria@example.com",
		});
	});

	it("lança erro quando o token não é informado", async () => {
		await expect(sut.execute("")).rejects.toThrow("Token não informado");
		expect(tokenProvider.verifyAccessToken).not.toHaveBeenCalled();
	});

	it("lança erro quando o usuário não existe", async () => {
		vi.mocked(tokenProvider.verifyAccessToken).mockReturnValue({
			sub: "user-id-1",
			email: "maria@example.com",
		});
		vi.mocked(usersRepository.findById).mockResolvedValue(null);

		await expect(sut.execute("access-token")).rejects.toThrow(
			"Usuário não encontrado",
		);
	});
});
