import { connection } from "@/database/connection";
import { PostgresMessagesRepository } from "@/repositories/implementations/PostgresMessagesRepository";
import { PostgresUsersRepository } from "@/repositories/implementations/PostgresUsersRepository";
import { MarkMessageSentController } from "./MarkMessageSentController";
import { MarkMessageSentUseCase } from "./MarkMessageSentUseCase";

const postgresMessagesRepository = new PostgresMessagesRepository(connection);
const postgresUsersRepository = new PostgresUsersRepository(connection);

const markMessageSentUseCase = new MarkMessageSentUseCase(
	postgresMessagesRepository,
	postgresUsersRepository,
);
const markMessageSentController = new MarkMessageSentController(
	markMessageSentUseCase,
);

export { markMessageSentController };
