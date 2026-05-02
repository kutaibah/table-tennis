"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { BEST_OF_OPTIONS } from "@/lib/tournament/constants";
import {
  updateTournamentAction,
  type ActionState,
} from "@/app/actions/tournaments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EditTournamentForm({
  tournamentId,
  name,
  description,
  startDateIso,
  bestOf,
  winMarginThreshold,
}: {
  tournamentId: string;
  name: string;
  description?: string;
  startDateIso?: string;
  bestOf: number;
  winMarginThreshold: number;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updateTournamentAction,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(state.success);
  }, [state.error, state.success]);

  const start = startDateIso
    ? startDateIso.slice(0, 10)
    : "";

  return (
    <form action={action} className="space-y-4 rounded-lg border p-4">
      <input type="hidden" name="tournamentId" value={tournamentId} />
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
      <div className="space-y-2">
        <Label htmlFor="edit-bestOf">Games per match</Label>
        <select
          id="edit-bestOf"
          name="bestOf"
          required
          disabled={pending}
          defaultValue={bestOf}
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
        <Label htmlFor="edit-margin">Score threshold (min lead)</Label>
        <Input
          id="edit-margin"
          name="winMarginThreshold"
          type="number"
          min={1}
          max={99}
          defaultValue={winMarginThreshold}
          disabled={pending}
        />
      </div>
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
