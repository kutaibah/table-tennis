"use client";

import { BEST_OF_OPTIONS } from "@/lib/tournament/constants";
import { roundColumnTitle } from "@/lib/tournament/bracketDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RoundMatchFormat } from "@/lib/tournament/matchFormat";
import { totalRoundsFromPlayerCount } from "@/lib/tournament/matchFormat";

export function RoundFormatsEditor({
  playerCount,
  disabled,
  rows,
  onRowsChange,
  variant,
  onReset,
}: {
  playerCount: number;
  disabled?: boolean;
  rows: RoundMatchFormat[];
  onRowsChange: (next: RoundMatchFormat[]) => void;
  variant: "create" | "edit";
  onReset?: () => void;
}) {
  const total = totalRoundsFromPlayerCount(playerCount);

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <p className="text-muted-foreground text-xs">
        Set games per match for each bracket stage (e.g. quarters Bo3, semis
        Bo5, final Bo7). Use &quot;1&quot; for a single total score; min lead
        applies only for that stage.
      </p>
      <div className="space-y-2">
        {rows.map((row, idx) => {
          const label = roundColumnTitle(row.round, total);
          return (
            <div
              key={row.round}
              className="bg-muted/30 grid gap-2 rounded-md border p-2 sm:grid-cols-3"
            >
              <div className="text-muted-foreground flex items-center text-xs font-medium">
                {label}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Games</Label>
                <select
                  className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm outline-none"
                  disabled={disabled}
                  value={row.bestOf}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    const next = rows.map((r, j) =>
                      j === idx
                        ? {
                            ...r,
                            bestOf: v as RoundMatchFormat["bestOf"],
                          }
                        : r,
                    );
                    onRowsChange(next);
                  }}
                >
                  {BEST_OF_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n === 1 ? "1 (single total)" : `Best-of-${n}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Min lead (if 1 game)</Label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  disabled={disabled || row.bestOf !== 1}
                  value={row.winMarginThreshold}
                  onChange={(e) => {
                    const v = Math.max(
                      1,
                      Math.min(99, Math.floor(Number(e.target.value)) || 1),
                    );
                    const next = rows.map((r, j) =>
                      j === idx ? { ...r, winMarginThreshold: v } : r,
                    );
                    onRowsChange(next);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {variant === "create" && onReset ? (
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="text-xs"
          disabled={disabled}
          onClick={onReset}
        >
          Reset rows to match defaults above
        </Button>
      ) : null}
    </div>
  );
}
