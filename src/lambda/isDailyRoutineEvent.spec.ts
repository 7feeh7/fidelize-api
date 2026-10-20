import { describe, expect, it } from "vitest";
import { isDailyRoutineEvent } from "./isDailyRoutineEvent";

describe("isDailyRoutineEvent", () => {
	it("retorna true quando action é daily-routine", () => {
		expect(isDailyRoutineEvent({ action: "daily-routine" })).toBe(true);
	});

	it("retorna false para eventos HTTP do API Gateway", () => {
		expect(
			isDailyRoutineEvent({
				version: "2.0",
				routeKey: "$default",
				rawPath: "/login",
				requestContext: { http: { method: "POST" } },
			}),
		).toBe(false);
	});

	it("retorna false para payloads nulos ou que não são objetos", () => {
		expect(isDailyRoutineEvent(null)).toBe(false);
		expect(isDailyRoutineEvent(undefined)).toBe(false);
		expect(isDailyRoutineEvent("daily-routine")).toBe(false);
	});
});
