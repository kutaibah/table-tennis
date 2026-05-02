"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import type { TournamentStatus } from "@/lib/tournament/constants";

import { removePlayerAction } from "@/app/actions/players";
import type { ActionState } from "@/app/actions/tournaments";
import { Button } from "@/components/ui/button";

export type PlayerRow = {
  _id: string;
  name: string;
  nickname?: string;
  seed?: number;
};

export function PlayerList({
  tournamentId,
  players,
  status,
}: {
  tournamentId: string;
  players: PlayerRow[];
  status: TournamentStatus;
}) {
  const locked =
    status === "drawn" || status === "in_progress" || status === "completed";

  const [state, action, pending] = useActionState<ActionState, FormData>(
    removePlayerAction,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  if (!players.length) {
    return (
      <p className="text-muted-foreground text-sm">No players added yet.</p>
    );
  }

  return (
    <ul className="divide-y rounded-lg border">
      {players.map((p) => (
        <li
          key={p._id}
          className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
        >
          <div>
            <span className="font-medium">{p.name}</span>
            {p.nickname ? (
              <span className="text-muted-foreground"> · {p.nickname}</span>
            ) : null}
            {p.seed != null ? (
              <span className="text-muted-foreground"> · Seed {p.seed}</span>
            ) : null}
          </div>
          {!locked ? (
            <form action={action}>
              <input type="hidden" name="tournamentId" value={tournamentId} />
              <input type="hidden" name="playerId" value={p._id} />
              <Button
                type="submit"
                variant="destructive"
                size="xs"
                disabled={pending}
              >
                Remove
              </Button>
            </form>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
