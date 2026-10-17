import { connection } from "@/database/connection";
import { PostgresUsersRepository } from "@/repositories/implementations/PostgresUsersRepository";
import { ListUsersController } from "./ListUsersController";
import { ListUsersUseCase } from "./ListUsersUseCase";

const postgresUsersRepository = new PostgresUsersRepository(connection);

const listUsersUseCase = new ListUsersUseCase(postgresUsersRepository);
const listUsersController = new ListUsersController(listUsersUseCase);

export { listUsersController, listUsersUseCase };
