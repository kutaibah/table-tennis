"use server";

import { redirect } from "next/navigation";

import type { ActionState } from "@/app/actions/tournaments";
import { safeRedirectPath } from "@/lib/auth/redirects";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { loginSchema, registerSchema } from "@/lib/auth/validations";
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { dbConnect } from "@/lib/db";
import UserModel from "@/models/User";

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let nextPath = "/admin/tournaments";
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    nextPath = safeRedirectPath(parsed.data.next);
    await dbConnect();

    const email = parsed.data.email.toLowerCase().trim();
    const user = await UserModel.findOne({ email }).select("+passwordHash");
    if (!user?.passwordHash) {
      return { error: "Invalid email or password." };
    }

    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
      return { error: "Invalid email or password." };
    }

    const token = await createSessionToken({
      userId: String(user._id),
      email: user.email,
    });
    await setSessionCookie(token);
  } catch (e) {
    if (e instanceof Error && e.message.includes("AUTH_SECRET")) {
      return { error: "Server auth is not configured (AUTH_SECRET)." };
    }
    console.error(e);
    return { error: "Could not sign in." };
  }

  redirect(nextPath);
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    await dbConnect();

    const existing = await UserModel.countDocuments();
    const allowMore = process.env.ALLOW_ADMIN_REGISTER === "true";
    if (existing > 0 && !allowMore) {
      return {
        error:
          "Registration is closed. Set ALLOW_ADMIN_REGISTER=true to add more admins, or sign in.",
      };
    }

    const email = parsed.data.email.toLowerCase().trim();
    const taken = await UserModel.findOne({ email });
    if (taken) {
      return { error: "An account with this email already exists." };
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const created = await UserModel.create({ email, passwordHash });

    const sessionToken = await createSessionToken({
      userId: String(created._id),
      email,
    });
    await setSessionCookie(sessionToken);
  } catch (e) {
    if (e instanceof Error && e.message.includes("AUTH_SECRET")) {
      return { error: "Server auth is not configured (AUTH_SECRET)." };
    }
    console.error(e);
    return { error: "Could not register." };
  }

  redirect("/admin/tournaments");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
