export interface ServiceInput {
	name: string;
	description?: string | null;
	price: number;
	durationMinutes?: number | null;
	suggestedReturnDays?: number | null;
}

export function validateServiceInput(data: ServiceInput): void {
	if (data.price < 0) {
		throw new Error("Preço inválido");
	}

	if (
		data.durationMinutes != null &&
		(!Number.isInteger(data.durationMinutes) || data.durationMinutes <= 0)
	) {
		throw new Error("Duração inválida");
	}

	if (
		data.suggestedReturnDays != null &&
		(!Number.isInteger(data.suggestedReturnDays) ||
			data.suggestedReturnDays <= 0)
	) {
		throw new Error("Prazo de retorno sugerido inválido");
	}
}
