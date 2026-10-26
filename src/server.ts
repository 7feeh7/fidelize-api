import { logger } from "@/providers/implementations/PinoLogger";
import { app } from "./app";

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
	logger.info(`Server running on port: ${PORT}`);
});
