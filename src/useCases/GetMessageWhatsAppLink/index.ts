import { connection } from "@/database/connection";
import { PostgresMessagesRepository } from "@/repositories/implementations/PostgresMessagesRepository";
import { GetMessageWhatsAppLinkController } from "./GetMessageWhatsAppLinkController";
import { GetMessageWhatsAppLinkUseCase } from "./GetMessageWhatsAppLinkUseCase";

const postgresMessagesRepository = new PostgresMessagesRepository(connection);

const getMessageWhatsAppLinkUseCase = new GetMessageWhatsAppLinkUseCase(
	postgresMessagesRepository,
);
const getMessageWhatsAppLinkController = new GetMessageWhatsAppLinkController(
	getMessageWhatsAppLinkUseCase,
);

export { getMessageWhatsAppLinkController };
