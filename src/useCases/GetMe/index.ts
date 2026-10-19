import type { SignOptions } from "jsonwebtoken";
import { connection } from "@/database/connection";
import { JwtTokenProvider } from "@/providers/implementations/JwtTokenProvider";
import { PostgresUsersRepository } from "@/repositories/implementations/PostgresUsersRepository";
import { GetMeController } from "./GetMeController";
import { GetMeUseCase } from "./GetMeUseCase";

const postgresUsersRepository = new PostgresUsersRepository(connection);
const jwtTokenProvider = new JwtTokenProvider(
	process.env.JWT_SECRET ?? "",
	(process.env.JWT_EXPIRES_IN ?? "1d") as SignOptions["expiresIn"],
	(process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"],
);

const getMeUseCase = new GetMeUseCase(
	postgresUsersRepository,
	jwtTokenProvider,
);
const getMeController = new GetMeController(getMeUseCase);

export { getMeController, getMeUseCase };
