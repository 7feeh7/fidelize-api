import { connection } from "@/database/connection";
import { PostgresMessagesRepository } from "@/repositories/implementations/PostgresMessagesRepository";
import { CancelMessageController } from "./CancelMessageController";
import { CancelMessageUseCase } from "./CancelMessageUseCase";

const postgresMessagesRepository = new PostgresMessagesRepository(connection);

const cancelMessageUseCase = new CancelMessageUseCase(postgresMessagesRepository);
const cancelMessageController = new CancelMessageController(cancelMessageUseCase);

export { cancelMessageController };
