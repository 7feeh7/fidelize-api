import type { NextFunction, Request, Response } from "express";
import type { ITokenProvider } from "@/providers/ITokenProvider";
import { TOKEN_NOT_PROVIDED_MESSAGE } from "@/useCases/GetMe/GetMeUseCase";
import { readBearerToken } from "@/utils/readBearerToken";

const INVALID_TOKEN_MESSAGE = "Token inválido";

function isUnauthorizedMessage(message: string): boolean {
	return (
		message === TOKEN_NOT_PROVIDED_MESSAGE || message === INVALID_TOKEN_MESSAGE
	);
}

export function createEnsureAuthenticated(tokenProvider: ITokenProvider) {
	return (request: Request, response: Response, next: NextFunction): void => {
		try {
			const accessToken = readBearerToken(request.headers.authorization);
			tokenProvider.verifyAccessToken(accessToken);
			next();
		} catch (err: unknown) {
			const message = (err as Error).message || INVALID_TOKEN_MESSAGE;

			if (isUnauthorizedMessage(message)) {
				response.status(401).json({ message });
				return;
			}

			response.status(401).json({ message: INVALID_TOKEN_MESSAGE });
		}
	};
}
