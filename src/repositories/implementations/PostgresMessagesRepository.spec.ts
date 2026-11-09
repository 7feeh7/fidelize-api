import type { Knex } from "knex";
import { afterEach, describe, expect, it } from "vitest";
import { Message } from "@/entities/Message";
import { createCaptureKnex } from "@/test/createCaptureKnex";
import { PostgresMessagesRepository } from "./PostgresMessagesRepository";

describe("PostgresMessagesRepository", () => {
	let db: Knex;

	afterEach(async () => {
		await db.destroy();
	});

	it("declara o predicado do índice parcial no ON CONFLICT", async () => {
		const capture = createCaptureKnex();
		db = capture.db;

		await new PostgresMessagesRepository(
			db,
		).saveIgnoringAppointmentItemConflict(
			"tenant-1",
			new Message({
				customerId: "customer-id",
				templateId: null,
				appointmentItemId: "item-id",
				customerRewardId: null,
				type: "RETURN_REMINDER",
				content: "Oi",
				status: "PENDING",
				scheduledFor: "2026-01-15",
				sentAt: null,
				sentBy: null,
				createdAt: new Date("2026-01-15T12:00:00.000Z"),
			}),
		);

		expect(capture.captured[0].sql).toMatch(
			/on conflict \(appointment_item_id\) where appointment_item_id is not null do nothing/i,
		);
	});
});
