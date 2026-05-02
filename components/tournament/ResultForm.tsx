"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { submitResultAction } from "@/app/actions/matches";
import type { ActionState } from "@/app/actions/tournaments";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ResultForm({
  matchId,
  hint,
  bestOf = 1,
}: {
  matchId: string;
  hint?: string;
  bestOf?: number;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    submitResultAction,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(state.success);
  }, [state.error, state.success]);

  const placeholder =
    bestOf > 1
      ? "11 7\n8 11\n12 10"
      : "11 7";

  return (
    <form action={action} className="space-y-2 border-t pt-3">
      {hint ? (
        <p className="text-muted-foreground text-xs leading-snug">{hint}</p>
      ) : null}
      <input type="hidden" name="matchId" value={matchId} />
      <div className="space-y-1">
        <Label htmlFor={`games-${matchId}`} className="text-xs">
          Game scores (Player A then B, one line per game)
        </Label>
        <textarea
          id={`games-${matchId}`}
          name="gameScoresText"
          required
          disabled={pending}
          rows={bestOf > 1 ? Math.min(bestOf + 1, 8) : 3}
          placeholder={placeholder}
          className={cn(
            "border-input bg-background w-full min-h-[4.5rem] rounded-lg border px-2.5 py-1.5 text-sm shadow-xs transition-colors outline-none",
            "placeholder:text-muted-foreground",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save result"}
      </Button>
    </form>
  );
}
