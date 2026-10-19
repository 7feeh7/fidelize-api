import { TOKEN_NOT_PROVIDED_MESSAGE } from "@/useCases/GetMe/GetMeUseCase";

export function readBearerToken(
	authorizationHeader: string | undefined,
): string {
	if (!authorizationHeader?.startsWith("Bearer ")) {
		throw new Error(TOKEN_NOT_PROVIDED_MESSAGE);
	}

	const accessToken = authorizationHeader.slice("Bearer ".length).trim();
	if (!accessToken) {
		throw new Error(TOKEN_NOT_PROVIDED_MESSAGE);
	}

	return accessToken;
}
