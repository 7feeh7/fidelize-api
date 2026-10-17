export const CUSTOMER_REWARD_STATUSES = [
	"AVAILABLE",
	"USED",
	"EXPIRED",
	"CANCELED",
] as const;

export type CustomerRewardStatus = (typeof CUSTOMER_REWARD_STATUSES)[number];

export class CustomerReward {
	readonly id?: string;
	public customerId!: string;
	public loyaltyRuleId!: string;
	public referralId!: string | null;
	public appointmentId!: string | null;
	public grantYear!: number | null;
	public status!: CustomerRewardStatus;
	public grantedAt!: Date;
	public expiresAt!: Date | null;
	public usedAt!: Date | null;

	constructor(props: Omit<CustomerReward, "id">, id?: string) {
		Object.assign(this, props);
		this.id = id ?? crypto.randomUUID();
	}
}
