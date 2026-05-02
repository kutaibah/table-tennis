import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ChampionCard({ name }: { name: string }) {
  return (
    <Card className="border-green-500/40 bg-green-500/5">
      <CardHeader>
        <CardDescription>Champion</CardDescription>
        <CardTitle className="text-2xl">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Tournament complete. Congratulations!
        </p>
      </CardContent>
    </Card>
  );
}
