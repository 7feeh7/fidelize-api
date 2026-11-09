import { connection } from "@/database/connection";
import { BcryptHashProvider } from "@/providers/implementations/BcryptHashProvider";
import { PostgresTenantsRepository } from "@/repositories/implementations/PostgresTenantsRepository";
import { PostgresUsersRepository } from "@/repositories/implementations/PostgresUsersRepository";
import { CreateUserController } from "./CreateUserController";
import { CreateUserUseCase } from "./CreateUserUseCase";

const postgresUsersRepository = new PostgresUsersRepository(connection);
const bcryptHashProvider = new BcryptHashProvider();
const postgresTenantsRepository = new PostgresTenantsRepository(connection);

const createUserUseCase = new CreateUserUseCase(
	postgresUsersRepository,
	bcryptHashProvider,
	postgresTenantsRepository,
);
const createUserController = new CreateUserController(createUserUseCase);

export { createUserController, createUserUseCase };
