export interface IAuthenticateUserRequestDTO {
	email: string;
	password: string;
}

export interface IAuthenticateUserResponseDTO {
	access_token: string;
	refresh_token: string;
	expires_in: number;
}
