import type { SignOptions } from "jsonwebtoken";
import { connection } from "@/database/connection";
import { BcryptHashProvider } from "@/providers/implementations/BcryptHashProvider";
import { JwtTokenProvider } from "@/providers/implementations/JwtTokenProvider";
import { PostgresUsersRepository } from "@/repositories/implementations/PostgresUsersRepository";
import { AuthenticateUserController } from "./AuthenticateUserController";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

const postgresUsersRepository = new PostgresUsersRepository(connection);
const bcryptHashProvider = new BcryptHashProvider();
const jwtTokenProvider = new JwtTokenProvider(
	process.env.JWT_SECRET ?? "",
	(process.env.JWT_EXPIRES_IN ?? "1d") as SignOptions["expiresIn"],
	(process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"],
);

const authenticateUserUseCase = new AuthenticateUserUseCase(
	postgresUsersRepository,
	bcryptHashProvider,
	jwtTokenProvider,
);
const authenticateUserController = new AuthenticateUserController(
	authenticateUserUseCase,
);

export { authenticateUserController, authenticateUserUseCase };
