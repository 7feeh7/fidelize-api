import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "@/entities/User";
import type { IHashProvider } from "@/providers/IHashProvider";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

describe("CreateUserUseCase", () => {
	let userRepository: IUsersRepository;
	let hashProvider: IHashProvider;
	let sut: CreateUserUseCase;

	beforeEach(() => {
		userRepository = {
			findByEmail: vi.fn(),
			save: vi.fn(),
		};
		hashProvider = {
			generateHash: vi.fn(),
			compareHash: vi.fn(),
		};
		sut = new CreateUserUseCase(userRepository, hashProvider);
	});

	it("persiste novo usuário com senha hasheada quando o e-mail está disponível", async () => {
		const request = {
			name: "Maria Silva",
			email: "maria@example.com",
			password: "senha-plana",
		};

		vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
		vi.mocked(hashProvider.generateHash).mockResolvedValue("senha-hasheada");

		await sut.execute(request);

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
	});

	it("lança erro quando o e-mail já está cadastrado", async () => {
		const existingUser = new User({
			name: "Usuário existente",
			email: "maria@example.com",
			password: "hash-antigo",
		});

		vi.mocked(userRepository.findByEmail).mockResolvedValue(existingUser);

		await expect(
			sut.execute({
				name: "Maria Silva",
				email: "maria@example.com",
				password: "senha-plana",
			}),
		).rejects.toThrow("O usuário já existe");

		expect(hashProvider.generateHash).not.toHaveBeenCalled();
		expect(userRepository.save).not.toHaveBeenCalled();
	});
});
