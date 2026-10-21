import { connection } from "@/database/connection";
import { PostgresReturnRemindersRepository } from "@/repositories/implementations/PostgresReturnRemindersRepository";
import { ListOverdueReturnsController } from "./ListOverdueReturnsController";
import { ListOverdueReturnsUseCase } from "./ListOverdueReturnsUseCase";

const postgresReturnRemindersRepository = new PostgresReturnRemindersRepository(
	connection,
);

const listOverdueReturnsUseCase = new ListOverdueReturnsUseCase(
	postgresReturnRemindersRepository,
);
const listOverdueReturnsController = new ListOverdueReturnsController(
	listOverdueReturnsUseCase,
);

export { listOverdueReturnsController };
