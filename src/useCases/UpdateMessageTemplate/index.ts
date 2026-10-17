import { connection } from "@/database/connection";
import { PostgresMessageTemplatesRepository } from "@/repositories/implementations/PostgresMessageTemplatesRepository";
import { UpdateMessageTemplateController } from "./UpdateMessageTemplateController";
import { UpdateMessageTemplateUseCase } from "./UpdateMessageTemplateUseCase";

const postgresMessageTemplatesRepository = new PostgresMessageTemplatesRepository(
	connection,
);

const updateMessageTemplateUseCase = new UpdateMessageTemplateUseCase(
	postgresMessageTemplatesRepository,
);
const updateMessageTemplateController = new UpdateMessageTemplateController(
	updateMessageTemplateUseCase,
);

export { updateMessageTemplateController };
