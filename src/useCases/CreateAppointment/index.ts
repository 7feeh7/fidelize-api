import { connection } from "@/database/connection";
import { PostgresAppointmentsRepository } from "@/repositories/implementations/PostgresAppointmentsRepository";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { PostgresServicesRepository } from "@/repositories/implementations/PostgresServicesRepository";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { PostgresReferralsRepository } from "@/repositories/implementations/PostgresReferralsRepository";
import { PostgresUsersRepository } from "@/repositories/implementations/PostgresUsersRepository";
import { CreateAppointmentController } from "./CreateAppointmentController";
import { CreateAppointmentUseCase } from "./CreateAppointmentUseCase";

const postgresAppointmentsRepository = new PostgresAppointmentsRepository(
	connection,
);
const postgresCustomersRepository = new PostgresCustomersRepository(connection);
const postgresServicesRepository = new PostgresServicesRepository(connection);
const postgresUsersRepository = new PostgresUsersRepository(connection);
const postgresReferralsRepository = new PostgresReferralsRepository(connection);
const postgresCustomerRewardsRepository = new PostgresCustomerRewardsRepository(
	connection,
);

const createAppointmentUseCase = new CreateAppointmentUseCase(
	postgresAppointmentsRepository,
	postgresCustomersRepository,
	postgresServicesRepository,
	postgresUsersRepository,
	postgresReferralsRepository,
	postgresCustomerRewardsRepository,
	connection,
);
const createAppointmentController = new CreateAppointmentController(
	createAppointmentUseCase,
);

export { createAppointmentController, createAppointmentUseCase };
