import type { NextFunction, Request, Response } from "express";
import { logger } from "@/providers/implementations/PinoLogger";

export function httpLogger(
	request: Request,
	response: Response,
	next: NextFunction,
): void {
	const start = Date.now();

	response.on("finish", () => {
		logger.info(
			{
				method: request.method,
				path: request.path,
				statusCode: response.statusCode,
				durationMs: Date.now() - start,
			},
			"Requisicao HTTP concluida",
		);
	});

	next();
}
