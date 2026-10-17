import { connection } from "@/database/connection";
import { PostgresAppointmentsRepository } from "@/repositories/implementations/PostgresAppointmentsRepository";
import { GetAppointmentController } from "./GetAppointmentController";
import { GetAppointmentUseCase } from "./GetAppointmentUseCase";

const postgresAppointmentsRepository = new PostgresAppointmentsRepository(
	connection,
);

const getAppointmentUseCase = new GetAppointmentUseCase(
	postgresAppointmentsRepository,
);
const getAppointmentController = new GetAppointmentController(
	getAppointmentUseCase,
);

export { getAppointmentController, getAppointmentUseCase };
