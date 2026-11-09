import type { UserRole } from "@/entities/User";

export interface ICreateUserRequestDTO {
	name: string;
	email: string;
	password: string;
	tenantId: string;
	role: UserRole;
}
