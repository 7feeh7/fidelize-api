import type { UserRole } from "@/entities/User";

declare global {
	namespace Express {
		interface Request {
			auth: {
				userId: string;
				tenantId: string;
				role: UserRole;
			};
		}
	}
}
