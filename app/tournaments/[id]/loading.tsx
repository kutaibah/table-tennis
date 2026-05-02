export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="bg-muted h-8 w-48 animate-pulse rounded-md" />
      <div className="bg-muted mt-4 h-4 w-full max-w-md animate-pulse rounded-md" />
      <div className="mt-8 flex gap-4">
        <div className="bg-muted h-40 flex-1 animate-pulse rounded-lg" />
        <div className="bg-muted h-40 flex-1 animate-pulse rounded-lg" />
      </div>
    </div>
  );
}
