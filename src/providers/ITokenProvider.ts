import type { UserRole } from "@/entities/User";

export interface ITokenPayload {
	sub: string;
	email: string;
	tenantId: string;
	role: UserRole;
}

export interface ITokenProvider {
	generateAccessToken(payload: ITokenPayload): string;
	generateRefreshToken(payload: ITokenPayload): string;
	verifyAccessToken(token: string): ITokenPayload;
}
