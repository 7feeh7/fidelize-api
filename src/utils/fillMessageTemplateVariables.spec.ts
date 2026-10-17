import { describe, expect, it } from "vitest";
import {
	extractFirstName,
	fillMessageTemplateVariables,
} from "./fillMessageTemplateVariables";

describe("fillMessageTemplateVariables", () => {
	it("substitui variáveis conhecidas", () => {
		const result = fillMessageTemplateVariables(
			"Oi {nome}! Seu {servico} faz {dias} dias no {negocio}.",
			{
				nome: "Ana",
				servico: "corte",
				dias: "15",
				negocio: "Salão Bella",
			},
		);

		expect(result).toBe("Oi Ana! Seu corte faz 15 dias no Salão Bella.");
	});

	it("remove variáveis sem valor e colapsa espaços", () => {
		const result = fillMessageTemplateVariables(
			"Oi {nome}!  Ganhe {beneficio} até {validade}.",
			{ nome: "João" },
		);

		expect(result).toBe("Oi João! Ganhe até .");
	});
});

describe("extractFirstName", () => {
	it("retorna o primeiro nome", () => {
		expect(extractFirstName("  Maria Clara  ")).toBe("Maria");
	});

	it("retorna vazio quando não há nome", () => {
		expect(extractFirstName("   ")).toBe("");
	});
});
