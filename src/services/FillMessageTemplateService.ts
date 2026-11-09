import { fillMessageTemplateVariables } from "@/utils/fillMessageTemplateVariables";
import type { BuildMessageTemplateVariableValuesService } from "./BuildMessageTemplateVariableValuesService";

export class FillMessageTemplateService {
	constructor(
		private buildVariableValuesService: BuildMessageTemplateVariableValuesService,
	) {}

	async execute(
		tenantId: string,
		content: string,
		customerId?: string,
	): Promise<string> {
		const variables = await this.buildVariableValuesService.execute(
			tenantId,
			customerId,
		);
		return fillMessageTemplateVariables(content, variables);
	}
}
