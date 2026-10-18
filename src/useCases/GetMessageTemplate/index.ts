import { connection } from "@/database/connection";
import { PostgresMessageTemplatesRepository } from "@/repositories/implementations/PostgresMessageTemplatesRepository";
import { GetMessageTemplateController } from "./GetMessageTemplateController";
import { GetMessageTemplateUseCase } from "./GetMessageTemplateUseCase";

const postgresMessageTemplatesRepository =
	new PostgresMessageTemplatesRepository(connection);

const getMessageTemplateUseCase = new GetMessageTemplateUseCase(
	postgresMessageTemplatesRepository,
);
const getMessageTemplateController = new GetMessageTemplateController(
	getMessageTemplateUseCase,
);

export { getMessageTemplateController };
