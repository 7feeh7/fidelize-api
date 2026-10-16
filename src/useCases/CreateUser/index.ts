import { connection } from "@/database/connection";
import { BcryptHashProvider } from "@/providers/implementations/BcryptHashProvider";
import { PostgresUsersRepository } from "@/repositories/implementations/PostgresUsersRepository";
import { CreateUserController } from "./CreateUserController";
import { CreateUserUseCase } from "./CreateUserUseCase";

const postgresUsersRepository = new PostgresUsersRepository(connection);
const bcryptHashProvider = new BcryptHashProvider();

const createUserUseCase = new CreateUserUseCase(
	postgresUsersRepository,
	bcryptHashProvider,
);
const createUserController = new CreateUserController(createUserUseCase);

export { createUserController, createUserUseCase };
