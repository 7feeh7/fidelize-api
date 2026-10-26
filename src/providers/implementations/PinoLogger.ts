import pino, { type Logger, type LoggerOptions } from "pino";

export interface LoggerEnv {
	LOG_LEVEL?: string;
	NODE_ENV?: string;
	VITEST?: string;
}

export function resolveLoggerOptions(env: LoggerEnv): LoggerOptions {
	const level = env.LOG_LEVEL ?? (env.VITEST === "true" ? "silent" : "info");

	const options: LoggerOptions = { level };

	if (env.NODE_ENV === "development") {
		options.transport = {
			target: "pino-pretty",
			options: {
				colorize: true,
				translateTime: "yyyy-mm-dd HH:MM:ss",
				ignore: "pid,hostname",
				sync: true,
			},
		};
	}

	return options;
}

export class PinoLogger {
	private static instance: Logger;

	private constructor() {}

	static getInstance(): Logger {
		if (!PinoLogger.instance) {
			PinoLogger.instance = pino(resolveLoggerOptions(process.env));
		}

		return PinoLogger.instance;
	}
}

export const logger = PinoLogger.getInstance();
