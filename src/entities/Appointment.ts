export class Appointment {
	readonly id?: string;
	public customerId!: string;
	public userId!: string | null;
	public appointmentDate!: Date;
	public subtotal!: number;
	public discountAmount!: number;
	public total!: number;
	public notes!: string | null;

	constructor(props: Omit<Appointment, "id">, id?: string) {
		Object.assign(this, props);
		this.id = id ?? crypto.randomUUID();
	}
}
