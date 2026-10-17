export const LOYALTY_TRIGGER_TYPES = [
	"FIRST_VISIT",
	"VISIT_COUNT",
	"REFERRAL_GIVEN",
	"REFERRAL_RECEIVED",
	"BIRTHDAY",
] as const;

export const LOYALTY_REWARD_TYPES = [
	"PERCENT_DISCOUNT",
	"FIXED_DISCOUNT",
	"FREE_SERVICE",
] as const;

export type LoyaltyTriggerType = (typeof LOYALTY_TRIGGER_TYPES)[number];
export type LoyaltyRewardType = (typeof LOYALTY_REWARD_TYPES)[number];

export class LoyaltyRule {
	readonly id?: string;
	public name!: string;
	public description!: string | null;
	public triggerType!: LoyaltyTriggerType;
	public visitCount!: number | null;
	public rewardType!: LoyaltyRewardType;
	public rewardValue!: number | null;
	public freeServiceId!: string | null;
	public validDays!: number | null;
	public active!: boolean;

	constructor(props: Omit<LoyaltyRule, "id">, id?: string) {
		Object.assign(this, props);
		this.id = id ?? crypto.randomUUID();
	}
}
