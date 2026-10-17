import { connection } from "@/database/connection";
import { RunDailyRoutineController } from "./RunDailyRoutineController";
import { RunDailyRoutineUseCase } from "./RunDailyRoutineUseCase";

const runDailyRoutineUseCase = new RunDailyRoutineUseCase(connection);
const runDailyRoutineController = new RunDailyRoutineController(
	runDailyRoutineUseCase,
);

export { runDailyRoutineController };
