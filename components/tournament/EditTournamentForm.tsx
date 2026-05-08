"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  totalRoundsFromPlayerCount,
  type RoundMatchFormat,
} from "@/lib/tournament/matchFormat";
import {
  updateTournamentAction,
  type ActionState,
} from "@/app/actions/tournaments";
import { RoundFormatsEditor } from "@/components/tournament/RoundFormatsEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BEST_OF_OPTIONS } from "@/lib/tournament/constants";

function fillRows(
  playerCount: number,
  initial: RoundMatchFormat[],
): RoundMatchFormat[] {
  const total = totalRoundsFromPlayerCount(playerCount);
  const byRound = new Map<number, RoundMatchFormat>(
    initial.map((r) => [r.round, { ...r }]),
  );
  const fallbackBo = (BEST_OF_OPTIONS as readonly number[]).includes(
    initial[0]?.bestOf ?? 1,
  )
    ? (initial[0]?.bestOf ?? 1)
    : 1;
  const fallbackMargin = Math.max(
    1,
    Math.min(99, Math.floor(initial[0]?.winMarginThreshold ?? 1)),
  );
  return Array.from({ length: total }, (_, i) => {
    const round = i + 1;
    return (
      byRound.get(round) ?? {
        round,
        bestOf: fallbackBo as RoundMatchFormat["bestOf"],
        winMarginThreshold: fallbackMargin,
      }
    );
  });
}

export function EditTournamentForm({
  tournamentId,
  name,
  description,
  startDateIso,
  playerCount,
  initialRoundFormats,
}: {
  tournamentId: string;
  name: string;
  description?: string;
  startDateIso?: string;
  playerCount: number;
  initialRoundFormats: RoundMatchFormat[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updateTournamentAction,
    {},
  );

  const [rows, setRows] = useState<RoundMatchFormat[]>(() =>
    fillRows(playerCount, initialRoundFormats),
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(state.success);
  }, [state.error, state.success]);

  const start = startDateIso ? startDateIso.slice(0, 10) : "";
  const roundFormatsJson = JSON.stringify(rows);

  return (
    <form action={action} className="space-y-4 rounded-lg border p-4">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <input
        type="hidden"
        name="roundFormatsJson"
        value={roundFormatsJson}
        readOnly
      />
      <div className="space-y-2">
        <Label htmlFor="edit-name">Name</Label>
        <Input
          id="edit-name"
          name="name"
          required
          defaultValue={name}
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <Input
          id="edit-description"
          name="description"
          defaultValue={description ?? ""}
          disabled={pending}
        />
      </div>

      <RoundFormatsEditor
        variant="edit"
        playerCount={playerCount}
        rows={rows}
        onRowsChange={setRows}
        disabled={pending}
      />

      <div className="space-y-2">
        <Label htmlFor="edit-start">Start date</Label>
        <Input
          id="edit-start"
          name="startDate"
          type="date"
          defaultValue={start}
          disabled={pending}
        />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
