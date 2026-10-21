import { AppointmentItem } from "@/entities/AppointmentItem";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import { computeReturnDueDate, roundMoney } from "./appointmentCalculations";

export interface AppointmentItemInput {
	serviceId: string;
	price: number;
}

export interface PrepareAppointmentItemsOptions {
	previousAppointmentDate?: Date;
	previousItems?: Array<{ serviceId: string; returnDueDate: string | null }>;
}

export async function prepareAppointmentItems(
	servicesRepository: IServicesRepository,
	appointmentDate: Date,
	requestItems: AppointmentItemInput[],
	options?: PrepareAppointmentItemsOptions,
): Promise<AppointmentItem[]> {
	if (!requestItems?.length) {
		throw new Error("Informe pelo menos um serviço");
	}

	const previousDate = options?.previousAppointmentDate;
	const dateUnchanged =
		previousDate != null &&
		previousDate.getTime() === appointmentDate.getTime();

	const previousReturnByServiceId = new Map<string, string | null>();
	for (const item of options?.previousItems ?? []) {
		previousReturnByServiceId.set(item.serviceId, item.returnDueDate);
	}

	const allowedInactiveServiceIds = new Set(
		options?.previousItems?.map((item) => item.serviceId) ?? [],
	);

	const items: AppointmentItem[] = [];

	for (const item of requestItems) {
		let service = await servicesRepository.findActiveById(item.serviceId);

		if (!service) {
			service = await servicesRepository.findById(item.serviceId);

			if (
				!service ||
				(!service.active && !allowedInactiveServiceIds.has(item.serviceId))
			) {
				throw new Error("Serviço não encontrado ou inativo");
			}
		}

		if (item.price < 0 || Number.isNaN(item.price)) {
			throw new Error("Preço do serviço inválido");
		}

		let returnDueDate: string | null;

		if (dateUnchanged && previousReturnByServiceId.has(service.id as string)) {
			returnDueDate =
				previousReturnByServiceId.get(service.id as string) ?? null;
		} else {
			returnDueDate = computeReturnDueDate(
				appointmentDate,
				service.suggestedReturnDays,
			);
		}

		items.push(
			new AppointmentItem({
				serviceId: service.id as string,
				price: roundMoney(item.price),
				returnDueDate,
			}),
		);
	}

	return items;
}

export function parseAppointmentDate(value: string): Date {
	const appointmentDate = new Date(value);

	if (Number.isNaN(appointmentDate.getTime())) {
		throw new Error("Data do atendimento inválida");
	}

	return appointmentDate;
}

export function normalizeDiscountAmount(value: number | undefined): number {
	const discountAmount = value ?? 0;

	if (discountAmount < 0 || Number.isNaN(discountAmount)) {
		throw new Error("Desconto inválido");
	}

	return roundMoney(discountAmount);
}
