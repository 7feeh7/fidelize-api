export interface IUpdateUserRequestDTO {
	accessToken: string;
	userId: string;
	name: string;
	email: string;
	password?: string;
}
