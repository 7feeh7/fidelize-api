import { connection } from "@/database/connection";
import { PostgresMessagesRepository } from "@/repositories/implementations/PostgresMessagesRepository";
import { GetMessagePendingCountController } from "./GetMessagePendingCountController";
import { GetMessagePendingCountUseCase } from "./GetMessagePendingCountUseCase";

const postgresMessagesRepository = new PostgresMessagesRepository(connection);

const getMessagePendingCountUseCase = new GetMessagePendingCountUseCase(
	postgresMessagesRepository,
);
const getMessagePendingCountController = new GetMessagePendingCountController(
	getMessagePendingCountUseCase,
);

export { getMessagePendingCountController };
