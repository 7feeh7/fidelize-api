export const TENANT_STATUSES = [
	"TRIAL",
	"ACTIVE",
	"SUSPENDED",
	"CANCELED",
] as const;

export type TenantStatus = (typeof TENANT_STATUSES)[number];

export const TENANT_STATUSES_WITH_ACCESS: TenantStatus[] = ["TRIAL", "ACTIVE"];

export class Tenant {
	readonly id?: string;
	public name!: string;
	public slug!: string;
	public status!: TenantStatus;

	constructor(props: Omit<Tenant, "id">, id?: string) {
		Object.assign(this, props);
		this.id = id ?? crypto.randomUUID();
	}
}

export function tenantHasAccess(status: TenantStatus): boolean {
	return TENANT_STATUSES_WITH_ACCESS.includes(status);
}
