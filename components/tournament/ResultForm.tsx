"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { submitResultAction } from "@/app/actions/matches";
import type { ActionState } from "@/app/actions/tournaments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ScoreRow = { a: string; b: string };

function emptyRows(n: number): ScoreRow[] {
  return Array.from({ length: n }, () => ({ a: "", b: "" }));
}

function rowsFromExisting(
  bestOf: number,
  existing?: { a: number; b: number }[] | null,
): ScoreRow[] {
  const base = emptyRows(bestOf);
  if (!existing?.length) return base;
  for (let i = 0; i < Math.min(existing.length, bestOf); i++) {
    const g = existing[i]!;
    base[i] = { a: String(g.a), b: String(g.b) };
  }
  return base;
}

function buildGameScoresText(
  rows: ScoreRow[],
): { ok: true; text: string } | { ok: false; message: string } {
  const lines: string[] = [];
  let seenFilled = false;
  for (let i = 0; i < rows.length; i++) {
    const at = rows[i]!.a.trim();
    const bt = rows[i]!.b.trim();
    const bothEmpty = at === "" && bt === "";
    if (bothEmpty) {
      if (seenFilled) {
        for (let j = i + 1; j < rows.length; j++) {
          const ja = rows[j]!.a.trim();
          const jb = rows[j]!.b.trim();
          if (ja !== "" || jb !== "") {
            return {
              ok: false,
              message:
                "Fill games in order. Clear lower rows or add scores to the next empty game only after the match is complete.",
            };
          }
        }
        break;
      }
      continue;
    }
    if (at === "" || bt === "") {
      return {
        ok: false,
        message: `Game ${i + 1}: enter points for both sides (left = A, right = B).`,
      };
    }
    const av = Number(at);
    const bv = Number(bt);
    if (!Number.isInteger(av) || !Number.isInteger(bv)) {
      return {
        ok: false,
        message: `Game ${i + 1}: use whole numbers only.`,
      };
    }
    seenFilled = true;
    lines.push(`${av} ${bv}`);
  }
  if (lines.length === 0) {
    return {
      ok: false,
      message:
        "Enter at least one game. Leave later rows blank if you are only recording the next game.",
    };
  }
  return { ok: true, text: lines.join("\n") };
}

function shortLabel(name: string, fallback: string) {
  const t = name.trim();
  if (!t) return fallback;
  return t.length <= 14 ? t : `${t.slice(0, 12)}…`;
}

export function ResultForm({
  matchId,
  hint,
  bestOf = 1,
  playerAName,
  playerBName,
  existingGameScores,
}: {
  matchId: string;
  hint?: string;
  bestOf?: number;
  playerAName?: string;
  playerBName?: string;
  /** Games already saved (e.g. match is live); pre-fills rows. */
  existingGameScores?: { a: number; b: number }[] | null;
}) {
  const [games, setGames] = useState<ScoreRow[]>(() =>
    rowsFromExisting(bestOf, existingGameScores),
  );
  const [dirty, setDirty] = useState(false);

  const [state, action, pending] = useActionState<ActionState, FormData>(
    submitResultAction,
    {},
  );

  const labelA = shortLabel(playerAName ?? "", "A pts");
  const labelB = shortLabel(playerBName ?? "", "B pts");

  const payload = useMemo(() => buildGameScoresText(games), [games]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(state.success);
  }, [state.error, state.success]);

  const canSubmit = payload.ok && !pending;

  return (
    <form action={action} className="space-y-3 border-t pt-3">
      {hint ? (
        <p className="text-muted-foreground text-xs leading-snug">{hint}</p>
      ) : null}
      <input type="hidden" name="matchId" value={matchId} />
      <input
        type="hidden"
        name="gameScoresText"
        value={payload.ok ? payload.text : ""}
        readOnly
        aria-hidden
      />
      <div className="space-y-1.5">
        <Label className="text-xs">
          Per-game points (left = player A, right = B)
        </Label>
        <div
          className={cn(
            "grid items-end gap-x-2 gap-y-1.5 text-xs",
            "grid-cols-[minmax(0,3.5rem)_1fr_1fr]",
          )}
        >
          <div />
          <span className="text-muted-foreground truncate text-[0.7rem] font-medium">
            {labelA}
          </span>
          <span className="text-muted-foreground truncate text-[0.7rem] font-medium">
            {labelB}
          </span>
          {games.map((row, i) => (
            <div key={i} className="contents">
              <span className="text-muted-foreground pr-1 text-right">
                G{i + 1}
              </span>
              <Input
                inputMode="numeric"
                disabled={pending}
                autoComplete="off"
                value={row.a}
                onChange={(e) => {
                  setDirty(true);
                  const v = e.target.value;
                  setGames((prev) =>
                    prev.map((r, j) => (j === i ? { ...r, a: v } : r)),
                  );
                }}
                className="h-8 font-mono text-sm"
                aria-label={`Game ${i + 1} points for player A`}
              />
              <Input
                inputMode="numeric"
                disabled={pending}
                autoComplete="off"
                value={row.b}
                onChange={(e) => {
                  setDirty(true);
                  const v = e.target.value;
                  setGames((prev) =>
                    prev.map((r, j) => (j === i ? { ...r, b: v } : r)),
                  );
                }}
                className="h-8 font-mono text-sm"
                aria-label={`Game ${i + 1} points for player B`}
              />
            </div>
          ))}
        </div>
        {dirty && !payload.ok ? (
          <p className="text-destructive text-xs leading-snug">
            {payload.message}
          </p>
        ) : null}
      </div>
      <Button type="submit" size="sm" disabled={!canSubmit}>
        {pending ? "Saving…" : "Save scores"}
      </Button>
    </form>
  );
}
