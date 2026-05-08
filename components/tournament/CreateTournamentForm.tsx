"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { createTournamentAction } from "@/app/actions/tournaments";
import type { ActionState } from "@/app/actions/tournaments";
import { BEST_OF_OPTIONS, PLAYER_COUNTS } from "@/lib/tournament/constants";
import {
  totalRoundsFromPlayerCount,
  uniformRoundFormats,
  type RoundMatchFormat,
} from "@/lib/tournament/matchFormat";
import { RoundFormatsEditor } from "@/components/tournament/RoundFormatsEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function buildUniformRows(
  playerCount: number,
  bestOf: number,
  margin: number,
): RoundMatchFormat[] {
  return uniformRoundFormats(playerCount, bestOf, margin);
}

export function CreateTournamentForm() {
  const [playerCount, setPlayerCount] = useState(4);
  const [defaultBestOf, setDefaultBestOf] = useState(1);
  const [defaultMargin, setDefaultMargin] = useState(1);
  const [rows, setRows] = useState<RoundMatchFormat[]>(() =>
    buildUniformRows(4, 1, 1),
  );

  const [state, action, pending] = useActionState<ActionState, FormData>(
    createTournamentAction,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  const total = totalRoundsFromPlayerCount(playerCount);
  const safeRows: RoundMatchFormat[] =
    rows.length === total
      ? rows
      : buildUniformRows(playerCount, defaultBestOf, defaultMargin);

  const roundFormatsJson = JSON.stringify(safeRows);

  return (
    <form action={action} className="mx-auto max-w-lg space-y-6">
      <input
        type="hidden"
        name="roundFormatsJson"
        value={roundFormatsJson}
        readOnly
      />
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
        <input type="hidden" name="playerCount" value={playerCount} />
        <select
          id="playerCount"
          value={playerCount}
          required
          disabled={pending}
          onChange={(e) => {
            const next = Number(e.target.value);
            setPlayerCount(next);
            setRows(buildUniformRows(next, defaultBestOf, defaultMargin));
          }}
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

      <div className="space-y-2 rounded-lg border p-3">
        <p className="text-sm font-medium">Default match length</p>
        <p className="text-muted-foreground text-xs">
          Used when you change player count or click &quot;Reset rows&quot; in
          the table below. Adjust each round separately there (e.g. Bo3 early,
          Bo5 semis, Bo7 final).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="default-bestOf">Default games per match</Label>
            <select
              id="default-bestOf"
              value={defaultBestOf}
              disabled={pending}
              onChange={(e) => setDefaultBestOf(Number(e.target.value))}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              {BEST_OF_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "1 — single total score" : `${n} — best-of-${n}`}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-margin">
              Default min lead (if 1 game)
            </Label>
            <Input
              id="default-margin"
              type="number"
              min={1}
              max={99}
              value={defaultMargin}
              disabled={pending}
              onChange={(e) =>
                setDefaultMargin(
                  Math.max(
                    1,
                    Math.min(99, Math.floor(Number(e.target.value)) || 1),
                  ),
                )
              }
            />
          </div>
        </div>
      </div>

      <RoundFormatsEditor
        variant="create"
        playerCount={playerCount}
        rows={safeRows}
        onRowsChange={setRows}
        disabled={pending}
        onReset={() =>
          setRows(buildUniformRows(playerCount, defaultBestOf, defaultMargin))
        }
      />

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
