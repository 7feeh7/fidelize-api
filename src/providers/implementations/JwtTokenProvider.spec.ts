import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { JwtTokenProvider } from "./JwtTokenProvider";

const SECRET = "test-secret";

describe("JwtTokenProvider", () => {
	const sut = new JwtTokenProvider(SECRET, "1h", "7d");

	it("devolve negócio e papel do token", () => {
		const token = sut.generateAccessToken({
			sub: "user-id",
			email: "user@example.com",
			tenantId: "tenant-1",
			role: "ATTENDANT",
		});

		expect(sut.verifyAccessToken(token)).toEqual({
			sub: "user-id",
			email: "user@example.com",
			tenantId: "tenant-1",
			role: "ATTENDANT",
		});
	});

	it("rejeita token antigo, sem negócio e papel", () => {
		const token = jwt.sign(
			{ sub: "user-id", email: "user@example.com" },
			SECRET,
		);

		expect(() => sut.verifyAccessToken(token)).toThrow("Token inválido");
	});

	it("rejeita token com papel desconhecido", () => {
		const token = jwt.sign(
			{
				sub: "user-id",
				email: "user@example.com",
				tenantId: "tenant-1",
				role: "SUPER_USER",
			},
			SECRET,
		);

		expect(() => sut.verifyAccessToken(token)).toThrow("Token inválido");
	});

	it("rejeita token assinado com outro segredo", () => {
		const token = jwt.sign(
			{
				sub: "user-id",
				email: "user@example.com",
				tenantId: "tenant-1",
				role: "PLATFORM_ADMIN",
			},
			"outro-segredo",
		);

		expect(() => sut.verifyAccessToken(token)).toThrow("Token inválido");
	});
});
