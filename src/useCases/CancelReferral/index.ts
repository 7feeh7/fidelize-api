import { connection } from "@/database/connection";
import { PostgresReferralsRepository } from "@/repositories/implementations/PostgresReferralsRepository";
import { CancelReferralController } from "./CancelReferralController";
import { CancelReferralUseCase } from "./CancelReferralUseCase";

const postgresReferralsRepository = new PostgresReferralsRepository(connection);

const cancelReferralUseCase = new CancelReferralUseCase(
	postgresReferralsRepository,
);
const cancelReferralController = new CancelReferralController(
	cancelReferralUseCase,
);

export { cancelReferralController, cancelReferralUseCase };
