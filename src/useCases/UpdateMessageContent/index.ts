import { connection } from "@/database/connection";
import { PostgresMessagesRepository } from "@/repositories/implementations/PostgresMessagesRepository";
import { UpdateMessageContentController } from "./UpdateMessageContentController";
import { UpdateMessageContentUseCase } from "./UpdateMessageContentUseCase";

const postgresMessagesRepository = new PostgresMessagesRepository(connection);

const updateMessageContentUseCase = new UpdateMessageContentUseCase(
	postgresMessagesRepository,
);
const updateMessageContentController = new UpdateMessageContentController(
	updateMessageContentUseCase,
);

export { updateMessageContentController };
