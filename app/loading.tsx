export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="bg-muted h-10 w-56 animate-pulse rounded-md" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="bg-muted h-32 animate-pulse rounded-lg" />
        <div className="bg-muted h-32 animate-pulse rounded-lg" />
      </div>
    </div>
  );
}
