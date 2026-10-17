import type { Knex } from "knex";
import type { Referral, ReferralStatus } from "@/entities/Referral";

export interface ReferralListItem {
	id: string;
	referrerId: string;
	referrerName: string;
	referredId: string;
	referredName: string;
	status: ReferralStatus;
	createdAt: Date;
	convertedAt: Date | null;
}

export interface ListReferralsParams {
	page: number;
	perPage: number;
	status?: ReferralStatus;
	referrerId?: string;
}

export interface ListReferralsResult {
	items: ReferralListItem[];
	total: number;
}

export interface IReferralsRepository {
	save(referral: Referral): Promise<void>;
	findByReferredId(referredId: string): Promise<Referral | null>;
	findById(id: string): Promise<Referral | null>;
	update(referral: Referral): Promise<void>;
	list(params: ListReferralsParams): Promise<ListReferralsResult>;
	countByReferrerId(referrerId: string): Promise<number>;
	convertPendingByReferredId(
		referredId: string,
		convertedAt: Date,
		trx?: Knex.Transaction,
	): Promise<Referral[]>;
}
