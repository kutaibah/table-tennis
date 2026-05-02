import bcrypt from "bcryptjs";

import { BCRYPT_ROUNDS } from "@/lib/auth/constants";

/**
 * One-way hash with per-password salt (bcrypt embeds salt in the stored string).
 * Do not store plaintext passwords.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, passwordHash);
}
