export const USER_ROLES = [
	"PLATFORM_ADMIN",
	"TENANT_ADMIN",
	"ATTENDANT",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export class User {
	readonly id?: string;
	public tenantId!: string;
	public role!: UserRole;
	public name!: string;
	public email!: string;
	public password!: string;
	public firstLoginAt!: Date | null;

	constructor(props: Omit<User, "id">, id?: string) {
		Object.assign(this, props);
		this.id = id ?? crypto.randomUUID();
	}
}
