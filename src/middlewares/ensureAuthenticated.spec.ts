import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import type { ITokenProvider } from "@/providers/ITokenProvider";
import { TOKEN_NOT_PROVIDED_MESSAGE } from "@/useCases/GetMe/GetMeUseCase";
import { createEnsureAuthenticated } from "./ensureAuthenticated";

describe("createEnsureAuthenticated", () => {
	const tokenProvider: ITokenProvider = {
		generateAccessToken: vi.fn(),
		generateRefreshToken: vi.fn(),
		verifyAccessToken: vi.fn(),
	};

	const sut = createEnsureAuthenticated(tokenProvider);

	function createMocks(authorization?: string) {
		const request = {
			headers: { authorization },
		} as Request;
		const json = vi.fn();
		const status = vi.fn(() => ({ json }));
		const response = { status } as unknown as Response;
		const next = vi.fn() as NextFunction;

		return { request, response, status, json, next };
	}

	it("chama next quando o token é válido", () => {
		const { request, response, next } = createMocks("Bearer access-token");
		vi.mocked(tokenProvider.verifyAccessToken).mockReturnValue({
			sub: "user-id",
			email: "user@example.com",
		});

		sut(request, response, next);

		expect(tokenProvider.verifyAccessToken).toHaveBeenCalledWith(
			"access-token",
		);
		expect(next).toHaveBeenCalled();
	});

	it("retorna 401 quando o token não é informado", () => {
		const { request, response, status, json, next } = createMocks();

		sut(request, response, next);

		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith({
			message: TOKEN_NOT_PROVIDED_MESSAGE,
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("retorna 401 quando o token é inválido", () => {
		const { request, response, status, json, next } = createMocks(
			"Bearer invalid-token",
		);
		vi.mocked(tokenProvider.verifyAccessToken).mockImplementation(() => {
			throw new Error("Token inválido");
		});

		sut(request, response, next);

		expect(status).toHaveBeenCalledWith(401);
		expect(json).toHaveBeenCalledWith({ message: "Token inválido" });
		expect(next).not.toHaveBeenCalled();
	});
});
