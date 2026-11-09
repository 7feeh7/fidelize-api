import type { IUsersRepository } from "@/repositories/IUsersRepository";
import type { IListUsersResponseDTO } from "./ListUsersDTO";

export class ListUsersUseCase {
	constructor(private usersRepository: IUsersRepository) {}

	async execute(tenantId: string): Promise<IListUsersResponseDTO> {
		const users = await this.usersRepository.listAll(tenantId);

		return {
			data: users,
		};
	}
}
