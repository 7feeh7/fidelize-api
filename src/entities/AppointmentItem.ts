export class AppointmentItem {
	readonly id?: string;
	public appointmentId!: string;
	public serviceId!: string;
	public price!: number;
	public returnDueDate!: string | null;

	constructor(
		props: Omit<AppointmentItem, "id" | "appointmentId"> & {
			appointmentId?: string;
		},
		id?: string,
	) {
		Object.assign(this, props);
		this.id = id ?? crypto.randomUUID();
	}
}
