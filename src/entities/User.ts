export class User {
	readonly id?: string;
	public name!: string;
	public email!: string;
	public password!: string;

	constructor(props: Omit<User, "id">, id?: string) {
		Object.assign(this, props);
		this.id = id ?? crypto.randomUUID();
	}
}
