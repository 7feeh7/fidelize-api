import { connection } from "@/database/connection";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { ListCustomersController } from "./ListCustomersController";
import { ListCustomersUseCase } from "./ListCustomersUseCase";

const postgresCustomersRepository = new PostgresCustomersRepository(connection);

const listCustomersUseCase = new ListCustomersUseCase(
	postgresCustomersRepository,
);
const listCustomersController = new ListCustomersController(
	listCustomersUseCase,
);

export { listCustomersController, listCustomersUseCase };
