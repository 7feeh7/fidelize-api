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
	save(tenantId: string, referral: Referral): Promise<void>;
	findByReferredId(
		tenantId: string,
		referredId: string,
	): Promise<Referral | null>;
	findById(tenantId: string, id: string): Promise<Referral | null>;
	update(tenantId: string, referral: Referral): Promise<void>;
	list(
		tenantId: string,
		params: ListReferralsParams,
	): Promise<ListReferralsResult>;
	countByReferrerId(tenantId: string, referrerId: string): Promise<number>;
	convertPendingByReferredId(
		tenantId: string,
		referredId: string,
		convertedAt: Date,
		trx?: Knex.Transaction,
	): Promise<Referral[]>;
}
