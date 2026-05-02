import Link from "next/link";

import { TournamentCard } from "@/components/tournament/TournamentCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { dbConnect } from "@/lib/db";
import TournamentModel from "@/models/Tournament";
import type { TournamentStatus } from "@/lib/tournament/constants";

export const dynamic = "force-dynamic";

type TournamentListItem = {
  _id: unknown;
  name: string;
  description?: string | null;
  playerCount: number;
  status: string;
  startDate?: Date | null;
};

export default async function AdminTournamentsPage() {
  let list: TournamentListItem[] = [];
  let dbError: string | null = null;

  try {
    await dbConnect();
    list = (await TournamentModel.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec()) as TournamentListItem[];
  } catch {
    dbError =
      "Database unavailable. Add MONGODB_URI to `.env.local` and ensure MongoDB is running.";
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Admin — Tournaments
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create draws and enter results.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tournaments/new">New tournament</Link>
        </Button>
      </div>

      {dbError ? (
        <Alert variant="destructive">
          <AlertTitle>Setup</AlertTitle>
          <AlertDescription>{dbError}</AlertDescription>
        </Alert>
      ) : null}

      {!dbError && !list.length ? (
        <p className="text-muted-foreground text-sm">No tournaments yet.</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((t) => (
          <TournamentCard
            key={String(t._id)}
            tournament={{
              name: t.name,
              description: t.description,
              playerCount: t.playerCount,
              status: t.status as TournamentStatus,
              startDate: t.startDate ?? undefined,
            }}
            href={`/admin/tournaments/${String(t._id)}`}
          />
        ))}
      </div>
    </div>
  );
}
