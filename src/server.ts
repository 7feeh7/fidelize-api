import { app } from "./app";
import { connection } from "./database/connection";
import { startDailyRoutine } from "./jobs/startDailyRoutine";

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
	console.log(`Server running on port: ${PORT}`);
	startDailyRoutine(connection);
});
