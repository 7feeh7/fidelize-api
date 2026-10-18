import type { LeadSource } from "@/entities/Customer";
import type { CustomerRewardItemDTO } from "@/utils/mapCustomerRewardToDTO";

export interface IGetCustomerSummaryResponseDTO {
	id: string;
	name: string;
	phone: string;
	dateOfBirth: string | null;
	leadSource: LeadSource;
	referrerId: string | null;
	referrerName: string | null;
	referralsMadeCount: number;
	indicators: {
		totalVisits: number;
		totalSpent: number;
		averageTicket: number | null;
		lastVisitDate: string | null;
		daysSinceLastVisit: number | null;
	};
	nextSuggestedReturnDate: string | null;
	expiringSoonRewards: CustomerRewardItemDTO[];
}
