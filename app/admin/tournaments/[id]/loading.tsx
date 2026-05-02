export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="bg-muted h-10 w-64 animate-pulse rounded-md" />
      <div className="bg-muted mt-6 h-32 w-full animate-pulse rounded-lg" />
    </div>
  );
}
