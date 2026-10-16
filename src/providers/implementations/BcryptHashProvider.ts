import { compare, hash } from "bcrypt";
import type { IHashProvider } from "../IHashProvider";

export class BcryptHashProvider implements IHashProvider {
	constructor(private saltRounds = 10) {}

	async generateHash(payload: string): Promise<string> {
		return hash(payload, this.saltRounds);
	}

	async compareHash(payload: string, hashed: string): Promise<boolean> {
		return compare(payload, hashed);
	}
}
