"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { deleteTournamentAction } from "@/app/actions/tournaments";
import type { ActionState } from "@/app/actions/tournaments";
import { Button } from "@/components/ui/button";

export function DeleteTournamentButton({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    deleteTournamentAction,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form action={action}>
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        {pending ? "Deleting…" : "Delete tournament"}
      </Button>
    </form>
  );
}
