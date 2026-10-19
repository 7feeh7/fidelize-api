export interface ITokenPayload {
	sub: string;
	email: string;
}

export interface ITokenProvider {
	generateAccessToken(payload: ITokenPayload): string;
	generateRefreshToken(payload: ITokenPayload): string;
	verifyAccessToken(token: string): ITokenPayload;
}
