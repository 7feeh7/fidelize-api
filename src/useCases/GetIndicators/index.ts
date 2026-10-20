import { connection } from "@/database/connection";
import { PostgresIndicatorsRepository } from "@/repositories/implementations/PostgresIndicatorsRepository";
import { GetIndicatorsController } from "./GetIndicatorsController";
import { GetIndicatorsUseCase } from "./GetIndicatorsUseCase";

const postgresIndicatorsRepository = new PostgresIndicatorsRepository(
	connection,
);

const getIndicatorsUseCase = new GetIndicatorsUseCase(
	postgresIndicatorsRepository,
);
const getIndicatorsController = new GetIndicatorsController(
	getIndicatorsUseCase,
);

export { getIndicatorsController };
