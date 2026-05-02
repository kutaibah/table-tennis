/** Only allow same-origin relative paths after login (open redirect safe). */
export function safeRedirectPath(next: string | undefined): string {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("://")
  ) {
    return "/admin/tournaments";
  }
  return next;
}
