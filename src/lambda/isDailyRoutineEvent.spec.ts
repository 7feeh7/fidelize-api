import { describe, expect, it } from "vitest";
import { isDailyRoutineEvent } from "./isDailyRoutineEvent";

describe("isDailyRoutineEvent", () => {
	it("returns true when action is daily-routine", () => {
		expect(isDailyRoutineEvent({ action: "daily-routine" })).toBe(true);
	});

	it("returns false for API Gateway HTTP events", () => {
		expect(
			isDailyRoutineEvent({
				version: "2.0",
				routeKey: "$default",
				rawPath: "/login",
				requestContext: { http: { method: "POST" } },
			}),
		).toBe(false);
	});

	it("returns false for nullish or non-object payloads", () => {
		expect(isDailyRoutineEvent(null)).toBe(false);
		expect(isDailyRoutineEvent(undefined)).toBe(false);
		expect(isDailyRoutineEvent("daily-routine")).toBe(false);
	});
});
