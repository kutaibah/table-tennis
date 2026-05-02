"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { createTournamentAction } from "@/app/actions/tournaments";
import type { ActionState } from "@/app/actions/tournaments";
import { BEST_OF_OPTIONS, PLAYER_COUNTS } from "@/lib/tournament/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateTournamentForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createTournamentAction,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form action={action} className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Tournament name</Label>
        <Input id="name" name="name" required disabled={pending} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input id="description" name="description" disabled={pending} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="playerCount">Number of players</Label>
        <select
          id="playerCount"
          name="playerCount"
          required
          disabled={pending}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {PLAYER_COUNTS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <p className="text-muted-foreground text-xs">
          Knockout tournaments currently require 4, 8, 16, or 32 players.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bestOf">Games per match</Label>
        <select
          id="bestOf"
          name="bestOf"
          required
          disabled={pending}
          defaultValue={1}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {BEST_OF_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n === 1
                ? "1 — single total score"
                : `${n} — best-of-${n} (games won)`}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="winMarginThreshold">Score threshold (min lead)</Label>
        <Input
          id="winMarginThreshold"
          name="winMarginThreshold"
          type="number"
          min={1}
          max={99}
          defaultValue={1}
          disabled={pending}
        />
        <p className="text-muted-foreground text-xs">
          When &quot;Games per match&quot; is 1, the winner&apos;s total must
          beat the loser by at least this many points. Ignored for best-of-3/5/7
          (those use standard games-won rules).
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="startDate">Start date (optional)</Label>
        <Input id="startDate" name="startDate" type="date" disabled={pending} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create tournament"}
      </Button>
    </form>
  );
}
