import { connection } from "@/database/connection";
import { PostgresMessageTemplatesRepository } from "@/repositories/implementations/PostgresMessageTemplatesRepository";
import { ListMessageTemplatesController } from "./ListMessageTemplatesController";
import { ListMessageTemplatesUseCase } from "./ListMessageTemplatesUseCase";

const postgresMessageTemplatesRepository =
	new PostgresMessageTemplatesRepository(connection);

const listMessageTemplatesUseCase = new ListMessageTemplatesUseCase(
	postgresMessageTemplatesRepository,
);
const listMessageTemplatesController = new ListMessageTemplatesController(
	listMessageTemplatesUseCase,
);

export { listMessageTemplatesController };
