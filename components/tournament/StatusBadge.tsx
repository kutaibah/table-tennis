import type { TournamentStatus } from "@/lib/tournament/constants";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const variant: Record<TournamentStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  players_added: "bg-secondary text-secondary-foreground",
  drawn: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  in_progress: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  completed: "bg-green-500/15 text-green-800 dark:text-green-200",
};

const label: Record<TournamentStatus, string> = {
  draft: "Draft",
  players_added: "Players",
  drawn: "Drawn",
  in_progress: "Live",
  completed: "Completed",
};

export function StatusBadge({
  status,
  className,
}: {
  status: TournamentStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn("font-medium capitalize", variant[status], className)}
    >
      {label[status]}
    </Badge>
  );
}
