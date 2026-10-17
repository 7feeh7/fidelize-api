import type { IUsersRepository } from "@/repositories/IUsersRepository";
import type { IListUsersResponseDTO } from "./ListUsersDTO";

export class ListUsersUseCase {
	constructor(private usersRepository: IUsersRepository) {}

	async execute(): Promise<IListUsersResponseDTO> {
		const users = await this.usersRepository.listAll();

		return {
			data: users,
		};
	}
}
