import { connection } from "@/database/connection";
import { PostgresMessageTemplatesRepository } from "@/repositories/implementations/PostgresMessageTemplatesRepository";
import { CreateMessageTemplateController } from "./CreateMessageTemplateController";
import { CreateMessageTemplateUseCase } from "./CreateMessageTemplateUseCase";

const postgresMessageTemplatesRepository = new PostgresMessageTemplatesRepository(
	connection,
);

const createMessageTemplateUseCase = new CreateMessageTemplateUseCase(
	postgresMessageTemplatesRepository,
);
const createMessageTemplateController = new CreateMessageTemplateController(
	createMessageTemplateUseCase,
);

export { createMessageTemplateController };
