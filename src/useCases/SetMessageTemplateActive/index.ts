import { connection } from "@/database/connection";
import { PostgresMessageTemplatesRepository } from "@/repositories/implementations/PostgresMessageTemplatesRepository";
import { SetMessageTemplateActiveController } from "./SetMessageTemplateActiveController";
import { SetMessageTemplateActiveUseCase } from "./SetMessageTemplateActiveUseCase";

const postgresMessageTemplatesRepository =
	new PostgresMessageTemplatesRepository(connection);

const setMessageTemplateActiveUseCase = new SetMessageTemplateActiveUseCase(
	postgresMessageTemplatesRepository,
);
const setMessageTemplateActiveController =
	new SetMessageTemplateActiveController(setMessageTemplateActiveUseCase);

export { setMessageTemplateActiveController };
