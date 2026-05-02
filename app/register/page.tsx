import Link from "next/link";

import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="w-full text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create admin account
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          For managing tournaments—not player signup for events.
        </p>
      </div>
      <RegisterForm />
      <p className="text-muted-foreground text-sm">
        <Link href="/" className="underline underline-offset-4">
          Back to home
        </Link>
      </p>
    </div>
  );
}
