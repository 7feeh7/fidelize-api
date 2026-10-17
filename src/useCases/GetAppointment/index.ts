import { connection } from "@/database/connection";
import { PostgresAppointmentsRepository } from "@/repositories/implementations/PostgresAppointmentsRepository";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { GetAppointmentController } from "./GetAppointmentController";
import { GetAppointmentUseCase } from "./GetAppointmentUseCase";

const postgresAppointmentsRepository = new PostgresAppointmentsRepository(
	connection,
);
const postgresCustomerRewardsRepository = new PostgresCustomerRewardsRepository(
	connection,
);

const getAppointmentUseCase = new GetAppointmentUseCase(
	postgresAppointmentsRepository,
	postgresCustomerRewardsRepository,
);
const getAppointmentController = new GetAppointmentController(
	getAppointmentUseCase,
);

export { getAppointmentController, getAppointmentUseCase };
