import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type PublicPlayerRow = {
  _id: string;
  name: string;
  nickname?: string;
  seed?: number;
};

export function PublicPlayerRoster({
  players,
  playerCount,
}: {
  players: PublicPlayerRow[];
  playerCount: number;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Registered players</h2>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Roster before the draw
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            <span className="font-medium text-foreground">
              {players.length}
            </span>{" "}
            / {playerCount} spots · Order is not the bracket yet (draw will be
            random unless seeding is used later).
          </p>
        </CardHeader>
        <CardContent>
          {!players.length ? (
            <p className="text-muted-foreground text-sm">
              No players yet. Check back once the organizer adds the roster.
            </p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {players.map((p, index) => (
                <li
                  key={p._id}
                  className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-3 py-2.5 text-sm"
                >
                  <span className="text-muted-foreground w-6 shrink-0 tabular-nums">
                    {index + 1}.
                  </span>
                  <div>
                    <span className="font-medium">{p.name}</span>
                    {p.nickname ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {p.nickname}
                      </span>
                    ) : null}
                    {p.seed != null ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · Seed {p.seed}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
