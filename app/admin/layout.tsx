/** Admin routes are protected by `middleware.ts` (session cookie + login redirect). */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
