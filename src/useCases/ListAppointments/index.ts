import { connection } from "@/database/connection";
import { PostgresAppointmentsRepository } from "@/repositories/implementations/PostgresAppointmentsRepository";
import { ListAppointmentsController } from "./ListAppointmentsController";
import { ListAppointmentsUseCase } from "./ListAppointmentsUseCase";

const postgresAppointmentsRepository = new PostgresAppointmentsRepository(
	connection,
);

const listAppointmentsUseCase = new ListAppointmentsUseCase(
	postgresAppointmentsRepository,
);
const listAppointmentsController = new ListAppointmentsController(
	listAppointmentsUseCase,
);

export { listAppointmentsController, listAppointmentsUseCase };
