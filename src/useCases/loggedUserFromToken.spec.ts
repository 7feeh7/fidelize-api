import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { CreateAppointmentController } from "./CreateAppointment/CreateAppointmentController";
import type { CreateAppointmentUseCase } from "./CreateAppointment/CreateAppointmentUseCase";
import { MarkMessageSentController } from "./MarkMessageSent/MarkMessageSentController";
import type { MarkMessageSentUseCase } from "./MarkMessageSent/MarkMessageSentUseCase";
import { UpdateAppointmentController } from "./UpdateAppointment/UpdateAppointmentController";
import type { UpdateAppointmentUseCase } from "./UpdateAppointment/UpdateAppointmentUseCase";

// O corpo tenta se passar por outro usuário e outro negócio.
function buildRequest() {
	return {
		body: {
			loggedUserId: "usuario-forjado",
			tenantId: "negocio-forjado",
			items: [],
		},
		params: { id: "registro-id" },
		auth: { userId: "usuario-do-token", tenantId: "negocio-do-token" },
	} as unknown as Request;
}

function buildResponse() {
	const response = {
		status: vi.fn(() => response),
		json: vi.fn(() => response),
		send: vi.fn(() => response),
	};

	return response as unknown as Response;
}

describe("identidade vem do token, não do corpo", () => {
	it("CreateAppointmentController", async () => {
		const execute = vi.fn().mockResolvedValue({ grantedRewards: [] });
		const sut = new CreateAppointmentController({
			execute,
		} as unknown as CreateAppointmentUseCase);

		await sut.handle(buildRequest(), buildResponse());

		expect(execute.mock.calls[0]?.[0]).toBe("negocio-do-token");
		expect(execute.mock.calls[0]?.[1].loggedUserId).toBe("usuario-do-token");
	});

	it("UpdateAppointmentController", async () => {
		const execute = vi.fn().mockResolvedValue(undefined);
		const sut = new UpdateAppointmentController({
			execute,
		} as unknown as UpdateAppointmentUseCase);

		await sut.handle(buildRequest(), buildResponse());

		expect(execute.mock.calls[0]?.[0]).toBe("negocio-do-token");
		expect(execute.mock.calls[0]?.[1].loggedUserId).toBe("usuario-do-token");
	});

	it("MarkMessageSentController", async () => {
		const execute = vi.fn().mockResolvedValue({ message: {} });
		const sut = new MarkMessageSentController({
			execute,
		} as unknown as MarkMessageSentUseCase);

		await sut.handle(buildRequest(), buildResponse());

		expect(execute.mock.calls[0]?.[0]).toBe("negocio-do-token");
		expect(execute.mock.calls[0]?.[1].loggedUserId).toBe("usuario-do-token");
	});
});
