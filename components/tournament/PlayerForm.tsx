"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import type { TournamentStatus } from "@/lib/tournament/constants";

import { addPlayerAction } from "@/app/actions/players";
import type { ActionState } from "@/app/actions/tournaments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PlayerForm({
  tournamentId,
  playerCount,
  currentCount,
  status,
}: {
  tournamentId: string;
  playerCount: number;
  currentCount: number;
  status: TournamentStatus;
}) {
  const locked =
    status === "drawn" || status === "in_progress" || status === "completed";
  const full = currentCount >= playerCount;

  const [state, action, pending] = useActionState<ActionState, FormData>(
    addPlayerAction,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form action={action} className="flex flex-col gap-4 rounded-lg border p-4">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <p className="text-muted-foreground text-sm">
        <span className="font-medium text-foreground">{currentCount}</span> /{" "}
        <span className="font-medium text-foreground">{playerCount}</span>{" "}
        players added
        {full ? (
          <span className="text-green-600 dark:text-green-400"> · Roster full</span>
        ) : (
          <span>
            {" "}
            · {playerCount - currentCount} slot{playerCount - currentCount === 1 ? "" : "s"} left
          </span>
        )}
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            disabled={locked || full || pending}
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nickname">Nickname (optional)</Label>
          <Input
            id="nickname"
            name="nickname"
            disabled={locked || full || pending}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="space-y-2 sm:max-w-xs">
        <Label htmlFor="seed">Seed (optional)</Label>
        <Input
          id="seed"
          name="seed"
          type="number"
          min={1}
          disabled={locked || full || pending}
        />
      </div>
      {locked ? (
        <p className="text-muted-foreground text-sm">
          Player list is locked after the draw is generated.
        </p>
      ) : null}
      <Button type="submit" disabled={locked || full || pending}>
        {pending ? "Adding…" : "Add player"}
      </Button>
    </form>
  );
}
