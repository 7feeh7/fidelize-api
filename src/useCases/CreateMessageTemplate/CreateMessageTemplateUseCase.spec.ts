import { beforeEach, describe, expect, it, vi } from "vitest";
import { MessageTemplate } from "@/entities/MessageTemplate";
import type { IMessageTemplatesRepository } from "@/repositories/IMessageTemplatesRepository";
import { CreateMessageTemplateUseCase } from "./CreateMessageTemplateUseCase";

const TENANT_ID = "tenant-1";

describe("CreateMessageTemplateUseCase", () => {
	let messageTemplatesRepository: IMessageTemplatesRepository;
	let sut: CreateMessageTemplateUseCase;

	beforeEach(() => {
		messageTemplatesRepository = {
			save: vi.fn(),
			findById: vi.fn(),
			listAll: vi.fn(),
			update: vi.fn(),
			setActive: vi.fn(),
			deactivateActiveByAutomaticType: vi.fn(),
			findActiveAutomaticByType: vi.fn(),
		};
		sut = new CreateMessageTemplateUseCase(messageTemplatesRepository);
	});

	it("desativa outros modelos automáticos do mesmo tipo ao criar", async () => {
		await sut.execute(TENANT_ID, {
			name: "Retorno padrão",
			type: "RETURN_REMINDER",
			content: "Oi {nome}!",
		});

		expect(
			messageTemplatesRepository.deactivateActiveByAutomaticType,
		).toHaveBeenCalledWith(TENANT_ID, "RETURN_REMINDER");
		expect(messageTemplatesRepository.save).toHaveBeenCalledTimes(1);

		const savedTemplate = vi.mocked(messageTemplatesRepository.save).mock
			.calls[0]?.[1];
		expect(savedTemplate).toBeInstanceOf(MessageTemplate);
		expect(savedTemplate?.type).toBe("RETURN_REMINDER");
		expect(savedTemplate?.active).toBe(true);
	});
});
