import { connection } from "@/database/connection";
import { PostgresAppointmentsRepository } from "@/repositories/implementations/PostgresAppointmentsRepository";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { PostgresReturnRemindersRepository } from "@/repositories/implementations/PostgresReturnRemindersRepository";
import { GetCustomerSummaryController } from "./GetCustomerSummaryController";
import { GetCustomerSummaryUseCase } from "./GetCustomerSummaryUseCase";

const postgresCustomersRepository = new PostgresCustomersRepository(connection);
const postgresAppointmentsRepository = new PostgresAppointmentsRepository(
	connection,
);
const postgresReturnRemindersRepository = new PostgresReturnRemindersRepository(
	connection,
);
const postgresCustomerRewardsRepository = new PostgresCustomerRewardsRepository(
	connection,
);

const getCustomerSummaryUseCase = new GetCustomerSummaryUseCase(
	postgresCustomersRepository,
	postgresAppointmentsRepository,
	postgresReturnRemindersRepository,
	postgresCustomerRewardsRepository,
);

const getCustomerSummaryController = new GetCustomerSummaryController(
	getCustomerSummaryUseCase,
);

export { getCustomerSummaryController };
