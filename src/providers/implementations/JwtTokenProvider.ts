import jwt, { type SignOptions } from "jsonwebtoken";
import type { ITokenPayload, ITokenProvider } from "../ITokenProvider";

export class JwtTokenProvider implements ITokenProvider {
	constructor(
		private secret: string,
		private accessExpiresIn: SignOptions["expiresIn"],
		private refreshExpiresIn: SignOptions["expiresIn"],
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
