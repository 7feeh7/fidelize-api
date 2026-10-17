import { connection } from "@/database/connection";
import { PostgresAppointmentsRepository } from "@/repositories/implementations/PostgresAppointmentsRepository";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { PostgresServicesRepository } from "@/repositories/implementations/PostgresServicesRepository";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { PostgresUsersRepository } from "@/repositories/implementations/PostgresUsersRepository";
import { UpdateAppointmentController } from "./UpdateAppointmentController";
import { UpdateAppointmentUseCase } from "./UpdateAppointmentUseCase";

const postgresAppointmentsRepository = new PostgresAppointmentsRepository(
	connection,
);
const postgresCustomersRepository = new PostgresCustomersRepository(connection);
const postgresServicesRepository = new PostgresServicesRepository(connection);
const postgresUsersRepository = new PostgresUsersRepository(connection);
const postgresCustomerRewardsRepository = new PostgresCustomerRewardsRepository(
	connection,
);

const updateAppointmentUseCase = new UpdateAppointmentUseCase(
	postgresAppointmentsRepository,
	postgresCustomersRepository,
	postgresServicesRepository,
	postgresUsersRepository,
	postgresCustomerRewardsRepository,
	connection,
);
const updateAppointmentController = new UpdateAppointmentController(
	updateAppointmentUseCase,
);

export { updateAppointmentController, updateAppointmentUseCase };
