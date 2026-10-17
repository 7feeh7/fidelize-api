import { connection } from "@/database/connection";
import { PostgresReferralsRepository } from "@/repositories/implementations/PostgresReferralsRepository";
import { ListReferralsController } from "./ListReferralsController";
import { ListReferralsUseCase } from "./ListReferralsUseCase";

const postgresReferralsRepository = new PostgresReferralsRepository(connection);

const listReferralsUseCase = new ListReferralsUseCase(
	postgresReferralsRepository,
);
const listReferralsController = new ListReferralsController(
	listReferralsUseCase,
);

export { listReferralsController, listReferralsUseCase };
