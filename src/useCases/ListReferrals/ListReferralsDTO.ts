import type { ReferralStatus } from "@/entities/Referral";

export interface IListReferralsRequestDTO {
	page: number;
	perPage: number;
	status?: ReferralStatus;
	referrerId?: string;
}

export interface IListReferralsResponseDTO {
	data: {
		id: string;
		referrerId: string;
		referrerName: string;
		referredId: string;
		referredName: string;
		status: ReferralStatus;
		createdAt: string;
		convertedAt: string | null;
	}[];
	page: number;
	totalPages: number;
}
