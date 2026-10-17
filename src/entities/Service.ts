export class Service {
	readonly id?: string;
	public name!: string;
	public description!: string | null;
	public price!: number;
	public durationMinutes!: number | null;
	public suggestedReturnDays!: number | null;
	public active!: boolean;

	constructor(props: Omit<Service, "id">, id?: string) {
		Object.assign(this, props);
		this.id = id ?? crypto.randomUUID();
	}
}
