import { describe, expect, it } from "vitest";
import { PinoLogger, resolveLoggerOptions } from "./PinoLogger";

describe("resolveLoggerOptions", () => {
	it("usa info como nível padrão fora de testes", () => {
		const options = resolveLoggerOptions({});

		expect(options.level).toBe("info");
		expect(options.transport).toBeUndefined();
	});

	it("usa silent quando VITEST está ativo e LOG_LEVEL não foi definido", () => {
		const options = resolveLoggerOptions({ VITEST: "true" });

		expect(options.level).toBe("silent");
	});

	it("respeita LOG_LEVEL mesmo com VITEST ativo", () => {
		const options = resolveLoggerOptions({
			VITEST: "true",
			LOG_LEVEL: "debug",
		});

		expect(options.level).toBe("debug");
	});

	it("configura pino-pretty em development", () => {
		const options = resolveLoggerOptions({ NODE_ENV: "development" });

		expect(options.transport).toEqual({
			target: "pino-pretty",
			options: {
				colorize: true,
				translateTime: "yyyy-mm-dd HH:MM:ss",
				ignore: "pid,hostname",
				sync: true,
			},
		});
	});
});

describe("PinoLogger", () => {
	it("getInstance retorna sempre a mesma instância", () => {
		const first = PinoLogger.getInstance();
		const second = PinoLogger.getInstance();

		expect(first).toBe(second);
	});
});
