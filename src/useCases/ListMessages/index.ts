import { connection } from "@/database/connection";
import { PostgresMessagesRepository } from "@/repositories/implementations/PostgresMessagesRepository";
import { ListMessagesController } from "./ListMessagesController";
import { ListMessagesUseCase } from "./ListMessagesUseCase";

const postgresMessagesRepository = new PostgresMessagesRepository(connection);

const listMessagesUseCase = new ListMessagesUseCase(postgresMessagesRepository);
const listMessagesController = new ListMessagesController(listMessagesUseCase);

export { listMessagesController };
