import { connection } from "@/database/connection";
import { PostgresMessageTemplatesRepository } from "@/repositories/implementations/PostgresMessageTemplatesRepository";
import { createFillMessageTemplateService } from "@/services/createFillMessageTemplateService";
import { PreviewMessageTemplateController } from "./PreviewMessageTemplateController";
import { PreviewMessageTemplateUseCase } from "./PreviewMessageTemplateUseCase";

const postgresMessageTemplatesRepository = new PostgresMessageTemplatesRepository(
	connection,
);

const previewMessageTemplateUseCase = new PreviewMessageTemplateUseCase(
	postgresMessageTemplatesRepository,
	createFillMessageTemplateService(),
);
const previewMessageTemplateController = new PreviewMessageTemplateController(
	previewMessageTemplateUseCase,
);

export { previewMessageTemplateController };
