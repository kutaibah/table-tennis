"use client";

import { Check, Loader2, Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
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
import { cn } from "@/lib/utils";

function shuffleCopy<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

const DRAW_MESSAGES = [
  "Shuffling seed order…",
  "Pairing first-round matchups…",
  "Locking the bracket…",
] as const;

const MIN_DRAW_MS = 1600;
const SUCCESS_HOLD_MS = 1100;

export function GenerateDrawButton({
  tournamentId,
  playerCount,
  currentCount,
  status,
  playerNames,
}: {
  tournamentId: string;
  playerCount: number;
  currentCount: number;
  status: TournamentStatus;
  /** Used for the draw “reveal” animation only. */
  playerNames: string[];
}) {
  const router = useRouter();
  const full = currentCount === playerCount;
  const canDraw = full && (status === "draft" || status === "players_added");

  const namePool = useMemo(() => {
    return playerNames.length ? playerNames : ["—"];
  }, [playerNames]);

  const [open, setOpen] = useState(false);
  /** confirm → drawing → success */
  const [phase, setPhase] = useState<"confirm" | "drawing" | "success">(
    "confirm",
  );
  const [shuffleDisplay, setShuffleDisplay] = useState<string[]>([]);
  const [messageIndex, setMessageIndex] = useState(0);

  const drawStartedAtRef = useRef<number | null>(null);
  const successTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [state, action, pending] = useActionState<ActionState, FormData>(
    generateDrawAction,
    {},
  );

  useEffect(() => {
    if (phase !== "drawing") return;
    const id = window.setInterval(() => {
      setShuffleDisplay(shuffleCopy(namePool));
    }, 85);
    return () => window.clearInterval(id);
  }, [phase, namePool]);

  useEffect(() => {
    if (phase !== "drawing") return;
    const id = window.setInterval(() => {
      setMessageIndex((i) => (i + 1) % DRAW_MESSAGES.length);
    }, 900);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (!state.error) return;
    toast.error(state.error);
    const t = window.setTimeout(() => {
      setPhase("confirm");
      drawStartedAtRef.current = null;
    }, 0);
    return () => window.clearTimeout(t);
  }, [state.error]);

  useEffect(() => {
    if (!state.success) return;

    for (const t of successTimersRef.current) {
      clearTimeout(t);
    }
    successTimersRef.current = [];

    const started = drawStartedAtRef.current ?? Date.now();
    const elapsed = Date.now() - started;
    const waitBeforeSuccess = Math.max(0, MIN_DRAW_MS - elapsed);

    const t1 = setTimeout(() => {
      setPhase("success");
      drawStartedAtRef.current = null;
      toast.success(state.success ?? "Draw generated.");

      const t2 = setTimeout(() => {
        setOpen(false);
        setPhase("confirm");
        router.refresh();
      }, SUCCESS_HOLD_MS);
      successTimersRef.current.push(t2);
    }, waitBeforeSuccess);
    successTimersRef.current.push(t1);

    return () => {
      for (const t of successTimersRef.current) {
        clearTimeout(t);
      }
      successTimersRef.current = [];
    };
  }, [state.success, router]);

  function onOpenChange(next: boolean) {
    if (!next && phase === "drawing") {
      return;
    }
    setOpen(next);
    if (!next) {
      setPhase("confirm");
      drawStartedAtRef.current = null;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={!canDraw || pending} variant="default">
          Generate draw
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={phase === "confirm"}
        className={cn(
          "gap-0 overflow-hidden p-0 sm:max-w-md",
          phase === "drawing" && "border-primary/30 shadow-lg shadow-primary/10",
        )}
        onPointerDownOutside={(e) => {
          if (phase === "drawing" || phase === "success") {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (phase === "drawing" || phase === "success") {
            e.preventDefault();
          }
        }}
      >
        {phase === "confirm" ? (
          <>
            <div className="p-4 pb-2">
              <DialogHeader>
                <DialogTitle>Generate public bracket?</DialogTitle>
                <DialogDescription>
                  This locks the roster and creates the knockout bracket with a
                  random first-round shuffle.
                </DialogDescription>
              </DialogHeader>
            </div>
            <DialogFooter className="gap-2 border-t bg-muted/40 p-4 sm:gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={pending}>
                  Cancel
                </Button>
              </DialogClose>
              <form
                action={action}
                onSubmit={() => {
                  drawStartedAtRef.current = Date.now();
                  setShuffleDisplay(shuffleCopy(namePool));
                  setPhase("drawing");
                  setMessageIndex(0);
                }}
              >
                <input type="hidden" name="tournamentId" value={tournamentId} />
                <Button type="submit" disabled={pending}>
                  {pending ? "Working…" : "Run the draw"}
                </Button>
              </form>
            </DialogFooter>
          </>
        ) : null}

        {phase === "drawing" ? (
          <div className="animate-in fade-in-0 zoom-in-95 flex flex-col gap-4 p-6 duration-300">
            <div className="flex items-center gap-3">
              <div className="bg-primary/15 text-primary rounded-full p-2.5">
                <Shuffle className="size-5 animate-pulse" aria-hidden />
              </div>
              <div>
                <p className="font-heading text-base font-medium">
                  Drawing the bracket
                </p>
                <p
                  key={messageIndex}
                  className="text-muted-foreground animate-in fade-in-0 text-sm duration-200"
                >
                  {DRAW_MESSAGES[messageIndex]}
                </p>
              </div>
            </div>
            <div className="relative rounded-lg border border-dashed bg-muted/30 px-3 py-3">
              <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                Shuffling players
              </p>
              <div className="flex flex-wrap gap-1.5">
                {shuffleDisplay.map((name, i) => (
                  <span
                    key={`${i}:${name}`}
                    className="bg-background text-foreground ring-border inline-flex animate-[draw-slot-jitter_0.18s_ease-out] rounded-md px-2 py-0.5 text-xs font-medium ring-1"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <Loader2 className="size-3.5 shrink-0 animate-spin" />
              <span>This only takes a moment…</span>
            </div>
          </div>
        ) : null}

        {phase === "success" ? (
          <div className="animate-in zoom-in-95 flex flex-col items-center gap-3 p-8 text-center duration-300">
            <div className="bg-primary/15 text-primary flex size-14 items-center justify-center rounded-full">
              <Check className="size-8 stroke-[2.5]" aria-hidden />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold">
                Bracket is live
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Opening the draw…
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
