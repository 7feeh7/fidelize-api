import type { SignOptions } from "jsonwebtoken";
import { connection } from "@/database/connection";
import { BcryptHashProvider } from "@/providers/implementations/BcryptHashProvider";
import { JwtTokenProvider } from "@/providers/implementations/JwtTokenProvider";
import { PostgresUsersRepository } from "@/repositories/implementations/PostgresUsersRepository";
import { UpdateUserController } from "./UpdateUserController";
import { UpdateUserUseCase } from "./UpdateUserUseCase";

const postgresUsersRepository = new PostgresUsersRepository(connection);
const jwtTokenProvider = new JwtTokenProvider(
	process.env.JWT_SECRET ?? "",
	(process.env.JWT_EXPIRES_IN ?? "1d") as SignOptions["expiresIn"],
	(process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"],
);
const bcryptHashProvider = new BcryptHashProvider();

const updateUserUseCase = new UpdateUserUseCase(
	postgresUsersRepository,
	jwtTokenProvider,
	bcryptHashProvider,
);
const updateUserController = new UpdateUserController(updateUserUseCase);

export { updateUserController, updateUserUseCase };
