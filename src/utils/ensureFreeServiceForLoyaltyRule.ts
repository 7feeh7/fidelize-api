import type { IServicesRepository } from "@/repositories/IServicesRepository";
import type { NormalizedLoyaltyRuleInput } from "./loyaltyRuleValidation";

export async function ensureFreeServiceForLoyaltyRule(
	tenantId: string,
	data: NormalizedLoyaltyRuleInput,
	servicesRepository: IServicesRepository,
): Promise<string | null> {
	if (data.rewardType !== "FREE_SERVICE" || !data.freeServiceId) {
		return null;
	}

	const service = await servicesRepository.findActiveById(
		tenantId,
		data.freeServiceId,
	);

	if (!service) {
		throw new Error("Serviço grátis inválido");
	}

	return service.name;
}
