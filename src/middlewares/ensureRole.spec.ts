import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import type { UserRole } from "@/entities/User";
import { ensureRole, FORBIDDEN_ROLE_MESSAGE } from "./ensureRole";

function createMocks(role?: UserRole) {
	const request = (role ? { auth: { role } } : {}) as Request;
	const json = vi.fn();
	const status = vi.fn(() => ({ json }));
	const response = { status } as unknown as Response;
	const next = vi.fn() as NextFunction;

	return { request, response, status, json, next };
}

describe("ensureRole", () => {
	const sut = ensureRole("PLATFORM_ADMIN");

	it("libera PLATFORM_ADMIN", () => {
		const { request, response, status, next } = createMocks("PLATFORM_ADMIN");

		sut(request, response, next);

		expect(next).toHaveBeenCalled();
		expect(status).not.toHaveBeenCalled();
	});

	it.each<UserRole>(["TENANT_ADMIN", "ATTENDANT"])(
		"retorna 403 para %s",
		(role) => {
			const { request, response, status, json, next } = createMocks(role);

			sut(request, response, next);

			expect(status).toHaveBeenCalledWith(403);
			expect(json).toHaveBeenCalledWith({ message: FORBIDDEN_ROLE_MESSAGE });
			expect(next).not.toHaveBeenCalled();
		},
	);

	it("retorna 403 quando a requisição não tem autenticação", () => {
		const { request, response, status, next } = createMocks();

		sut(request, response, next);

		expect(status).toHaveBeenCalledWith(403);
		expect(next).not.toHaveBeenCalled();
	});
});
