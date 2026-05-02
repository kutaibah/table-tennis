import Link from "next/link";

import { CreateTournamentForm } from "@/components/tournament/CreateTournamentForm";
import { Button } from "@/components/ui/button";

export default function NewTournamentPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          New tournament
        </h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/tournaments">Back</Link>
        </Button>
      </div>
      <CreateTournamentForm />
    </div>
  );
}
