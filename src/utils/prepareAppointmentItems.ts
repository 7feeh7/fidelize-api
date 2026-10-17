import { AppointmentItem } from "@/entities/AppointmentItem";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import {
	computeReturnDueDate,
	roundMoney,
} from "./appointmentCalculations";

export interface AppointmentItemInput {
	serviceId: string;
	price: number;
}

export async function prepareAppointmentItems(
	servicesRepository: IServicesRepository,
	appointmentDate: Date,
	requestItems: AppointmentItemInput[],
): Promise<AppointmentItem[]> {
	if (!requestItems?.length) {
		throw new Error("Informe pelo menos um serviço");
	}

	const items: AppointmentItem[] = [];

	for (const item of requestItems) {
		const service = await servicesRepository.findActiveById(item.serviceId);

		if (!service) {
			throw new Error("Serviço não encontrado ou inativo");
		}

		if (item.price < 0 || Number.isNaN(item.price)) {
			throw new Error("Preço do serviço inválido");
		}

		items.push(
			new AppointmentItem({
				serviceId: service.id as string,
				price: roundMoney(item.price),
				returnDueDate: computeReturnDueDate(
					appointmentDate,
					service.suggestedReturnDays,
				),
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
