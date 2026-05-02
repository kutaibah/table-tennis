import { getSession } from "@/lib/auth/session";

export type AuthGuardError = { error: string };

export async function requireAuthAction(): Promise<AuthGuardError | null> {
  const session = await getSession();
  if (!session) {
    return { error: "You must be signed in." };
  }
  return null;
}
