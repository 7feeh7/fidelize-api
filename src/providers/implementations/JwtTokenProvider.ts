import jwt from "jsonwebtoken";
import type { ITokenPayload, ITokenProvider } from "../ITokenProvider";

export class JwtTokenProvider implements ITokenProvider {
	constructor(
		private secret: string,
		private accessExpiresIn: string,
		private refreshExpiresIn: string,
	) {
		if (!secret) {
			throw new Error("JWT_SECRET não configurado");
		}
	}

	generateAccessToken(payload: ITokenPayload): string {
		return jwt.sign(payload, this.secret, {
			expiresIn: this.accessExpiresIn,
		});
	}

	generateRefreshToken(payload: ITokenPayload): string {
		return jwt.sign(payload, this.secret, {
			expiresIn: this.refreshExpiresIn,
		});
	}
}
