import { connection } from "@/database/connection";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { PostgresMessageTemplatesRepository } from "@/repositories/implementations/PostgresMessageTemplatesRepository";
import { PostgresMessagesRepository } from "@/repositories/implementations/PostgresMessagesRepository";
import { createFillMessageTemplateService } from "@/services/createFillMessageTemplateService";
import { CreateCustomerMessageController } from "./CreateCustomerMessageController";
import { CreateCustomerMessageUseCase } from "./CreateCustomerMessageUseCase";

const postgresCustomersRepository = new PostgresCustomersRepository(connection);
const postgresMessageTemplatesRepository = new PostgresMessageTemplatesRepository(
	connection,
);
const postgresMessagesRepository = new PostgresMessagesRepository(connection);

const createCustomerMessageUseCase = new CreateCustomerMessageUseCase(
	postgresCustomersRepository,
	postgresMessageTemplatesRepository,
	postgresMessagesRepository,
	createFillMessageTemplateService(),
);
const createCustomerMessageController = new CreateCustomerMessageController(
	createCustomerMessageUseCase,
);

export { createCustomerMessageController };
