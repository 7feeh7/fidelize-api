import type { BuildMessageTemplateVariableValuesService } from "./BuildMessageTemplateVariableValuesService";
import { fillMessageTemplateVariables } from "@/utils/fillMessageTemplateVariables";

export class FillMessageTemplateService {
	constructor(
		private buildVariableValuesService: BuildMessageTemplateVariableValuesService,
	) {}

	async execute(content: string, customerId?: string): Promise<string> {
		const variables = await this.buildVariableValuesService.execute(customerId);
		return fillMessageTemplateVariables(content, variables);
	}
}
