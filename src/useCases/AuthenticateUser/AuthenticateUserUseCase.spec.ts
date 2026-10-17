import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "@/entities/User";
import type { IHashProvider } from "@/providers/IHashProvider";
import type { ITokenProvider } from "@/providers/ITokenProvider";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

describe("AuthenticateUserUseCase", () => {
	let userRepository: IUsersRepository;
	let hashProvider: IHashProvider;
	let tokenProvider: ITokenProvider;
	let sut: AuthenticateUserUseCase;

	beforeEach(() => {
		userRepository = {
			findByEmail: vi.fn(),
			save: vi.fn(),
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
		};
		sut = new AuthenticateUserUseCase(
			userRepository,
			hashProvider,
			tokenProvider,
		);
	});

	it("retorna tokens e expires_in quando as credenciais são válidas", async () => {
		const user = new User(
			{
				name: "Maria Silva",
				email: "maria@example.com",
				password: "senha-hasheada",
			},
			"user-id-1",
		);

		const accessToken = jwt.sign(
			{ sub: "user-id-1", email: "maria@example.com" },
			"test-secret",
			{ expiresIn: 3600 },
		);

		vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
		vi.mocked(hashProvider.compareHash).mockResolvedValue(true);
		vi.mocked(tokenProvider.generateAccessToken).mockReturnValue(accessToken);
		vi.mocked(tokenProvider.generateRefreshToken).mockReturnValue(
			"refresh-token",
		);

		const result = await sut.execute({
			email: "maria@example.com",
			password: "senha-plana",
		});

		expect(userRepository.findByEmail).toHaveBeenCalledWith(
			"maria@example.com",
		);
		expect(hashProvider.compareHash).toHaveBeenCalledWith(
			"senha-plana",
			"senha-hasheada",
		);
		expect(tokenProvider.generateAccessToken).toHaveBeenCalledWith({
			sub: "user-id-1",
			email: "maria@example.com",
		});
		expect(tokenProvider.generateRefreshToken).toHaveBeenCalledWith({
			sub: "user-id-1",
			email: "maria@example.com",
		});
		expect(result).toEqual({
			access_token: accessToken,
			refresh_token: "refresh-token",
			expires_in: 3600,
		});
		expect(result).not.toHaveProperty("user");
	});

	it("lança erro genérico quando o e-mail não está cadastrado", async () => {
		vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

		await expect(
			sut.execute({
				email: "maria@example.com",
				password: "senha-plana",
			}),
		).rejects.toThrow("Credenciais inválidas");

		expect(hashProvider.compareHash).not.toHaveBeenCalled();
		expect(tokenProvider.generateAccessToken).not.toHaveBeenCalled();
	});

	it("lança o mesmo erro genérico quando a senha está incorreta", async () => {
		const user = new User({
			name: "Maria Silva",
			email: "maria@example.com",
			password: "senha-hasheada",
		});

		vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
		vi.mocked(hashProvider.compareHash).mockResolvedValue(false);

		await expect(
			sut.execute({
				email: "maria@example.com",
				password: "senha-errada",
			}),
		).rejects.toThrow("Credenciais inválidas");

		expect(tokenProvider.generateAccessToken).not.toHaveBeenCalled();
	});
});
