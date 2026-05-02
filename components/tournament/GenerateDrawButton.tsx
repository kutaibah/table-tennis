"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import type { TournamentStatus } from "@/lib/tournament/constants";

import { generateDrawAction } from "@/app/actions/draw";
import type { ActionState } from "@/app/actions/tournaments";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function GenerateDrawButton({
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
  const full = currentCount === playerCount;
  const canDraw = full && (status === "draft" || status === "players_added");

  const [state, action, pending] = useActionState<ActionState, FormData>(
    generateDrawAction,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(state.success);
  }, [state.error, state.success]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!canDraw || pending} variant="default">
          Generate draw
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate public bracket?</DialogTitle>
          <DialogDescription>
            This will lock the player list and generate the public bracket.
            Continue?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <form action={action}>
            <input type="hidden" name="tournamentId" value={tournamentId} />
            <Button type="submit" disabled={pending}>
              {pending ? "Generating…" : "Continue"}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
