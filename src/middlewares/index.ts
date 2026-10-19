import type { SignOptions } from "jsonwebtoken";
import { JwtTokenProvider } from "@/providers/implementations/JwtTokenProvider";
import { createEnsureAuthenticated } from "./ensureAuthenticated";

const jwtTokenProvider = new JwtTokenProvider(
	process.env.JWT_SECRET ?? "",
	(process.env.JWT_EXPIRES_IN ?? "1d") as SignOptions["expiresIn"],
	(process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"],
);

const ensureAuthenticated = createEnsureAuthenticated(jwtTokenProvider);

export { ensureAuthenticated };
