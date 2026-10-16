export const LEAD_SOURCES = [
	"INDICACAO",
	"INSTAGRAM",
	"PANFLETO",
	"OUTRO",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export class Customer {
	readonly id?: string;
	public name!: string;
	public phone!: string;
	public dateOfBirth!: string | null;
	public leadSource!: LeadSource;

	constructor(props: Omit<Customer, "id">, id?: string) {
		Object.assign(this, props);
		this.id = id ?? crypto.randomUUID();
	}
}
