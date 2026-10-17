import { connection } from "@/database/connection";
import { PostgresBirthdaysRepository } from "@/repositories/implementations/PostgresBirthdaysRepository";
import { ListMonthlyBirthdaysController } from "./ListMonthlyBirthdaysController";
import { ListMonthlyBirthdaysUseCase } from "./ListMonthlyBirthdaysUseCase";

const postgresBirthdaysRepository = new PostgresBirthdaysRepository(connection);

const listMonthlyBirthdaysUseCase = new ListMonthlyBirthdaysUseCase(
	postgresBirthdaysRepository,
);
const listMonthlyBirthdaysController = new ListMonthlyBirthdaysController(
	listMonthlyBirthdaysUseCase,
);

export { listMonthlyBirthdaysController };
