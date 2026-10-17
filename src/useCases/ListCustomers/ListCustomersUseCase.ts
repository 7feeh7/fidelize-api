import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type {
	IListCustomersRequestDTO,
	IListCustomersResponseDTO,
} from "./ListCustomersDTO";

export class ListCustomersUseCase {
	constructor(private customersRepository: ICustomersRepository) {}

	async execute(
		data: IListCustomersRequestDTO,
	): Promise<IListCustomersResponseDTO> {
		const page = data.page < 1 ? 1 : data.page;
		const perPage = data.perPage < 1 ? 10 : data.perPage;

		const { items, total } = await this.customersRepository.list({
			page,
			perPage,
			search: data.search,
		});

		const totalPages = total === 0 ? 0 : Math.ceil(total / perPage);

		return {
			data: items.map((customer) => ({
				id: customer.id as string,
				name: customer.name,
				phone: customer.phone,
				dateOfBirth: customer.dateOfBirth,
				leadSource: customer.leadSource,
			})),
			page,
			totalPages,
		};
	}
}
