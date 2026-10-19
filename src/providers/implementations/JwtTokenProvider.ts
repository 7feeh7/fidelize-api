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

	verifyAccessToken(token: string): ITokenPayload {
		try {
			const decoded = jwt.verify(token, this.secret) as jwt.JwtPayload;

			if (
				typeof decoded.sub !== "string" ||
				typeof decoded.email !== "string" ||
				!decoded.sub.trim() ||
				!decoded.email.trim()
			) {
				throw new Error("Token inválido");
			}

			return {
				sub: decoded.sub,
				email: decoded.email,
			};
		} catch {
			throw new Error("Token inválido");
		}
	}
}
