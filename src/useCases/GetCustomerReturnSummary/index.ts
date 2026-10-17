import { connection } from "@/database/connection";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { PostgresReturnRemindersRepository } from "@/repositories/implementations/PostgresReturnRemindersRepository";
import { GetCustomerReturnSummaryController } from "./GetCustomerReturnSummaryController";
import { GetCustomerReturnSummaryUseCase } from "./GetCustomerReturnSummaryUseCase";

const postgresCustomersRepository = new PostgresCustomersRepository(connection);
const postgresReturnRemindersRepository = new PostgresReturnRemindersRepository(
	connection,
);

const getCustomerReturnSummaryUseCase = new GetCustomerReturnSummaryUseCase(
	postgresCustomersRepository,
	postgresReturnRemindersRepository,
);
const getCustomerReturnSummaryController = new GetCustomerReturnSummaryController(
	getCustomerReturnSummaryUseCase,
);

export { getCustomerReturnSummaryController };
