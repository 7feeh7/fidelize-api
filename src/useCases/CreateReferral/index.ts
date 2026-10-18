import { connection } from "@/database/connection";
import { CreateReferralController } from "./CreateReferralController";
import { CreateReferralUseCase } from "./CreateReferralUseCase";

const createReferralUseCase = new CreateReferralUseCase(connection);
const createReferralController = new CreateReferralController(
	createReferralUseCase,
);

export { createReferralController, createReferralUseCase };
