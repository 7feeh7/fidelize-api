import { User } from "@/entities/User";
import type { IHashProvider } from "@/providers/IHashProvider";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import type { ICreateUserRequestDTO } from "./CreateUserDTO";

export class CreateUserUseCase {
	constructor(
		private userRepository: IUsersRepository,
		private hashProvider: IHashProvider,
	) {}

	async execute(data: ICreateUserRequestDTO) {
		const userAlreadyExists = await this.userRepository.findByEmail(data.email);
		if (userAlreadyExists) {
			throw new Error("User already exists");
		}

		const hashedPassword = await this.hashProvider.generateHash(data.password);

		const user = new User({ ...data, password: hashedPassword });
		await this.userRepository.save(user);
	}
}
