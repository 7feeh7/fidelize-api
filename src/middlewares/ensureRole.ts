import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@/entities/User";

export const FORBIDDEN_ROLE_MESSAGE =
	"Você não tem permissão para realizar esta ação";

export function ensureRole(...allowedRoles: UserRole[]) {
	return (request: Request, response: Response, next: NextFunction): void => {
		if (!allowedRoles.includes(request.auth?.role)) {
			response.status(403).json({ message: FORBIDDEN_ROLE_MESSAGE });
			return;
		}

		next();
	};
}
