export function readRouteParam(
	value: string | string[] | undefined,
	paramName: string,
): string {
	if (typeof value !== "string" || value.length === 0) {
		throw new Error(`Parâmetro de rota inválido: ${paramName}`);
	}

	return value;
}
