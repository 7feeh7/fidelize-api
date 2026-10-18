export const REFERRAL_STATUSES = ["PENDING", "CONVERTED", "CANCELED"] as const;

export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];

export class Referral {
	readonly id?: string;
	public referrerId!: string;
	public referredId!: string;
	public status!: ReferralStatus;
	public createdAt?: Date;
	public convertedAt!: Date | null;

	constructor(props: Omit<Referral, "id" | "createdAt">, id?: string) {
		Object.assign(this, props);
		this.id = id ?? crypto.randomUUID();
		if (this.convertedAt === undefined) {
			this.convertedAt = null;
		}
	}
}
