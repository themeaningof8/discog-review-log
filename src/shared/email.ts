/** Canonical email form for storage and lookup (trim + lowercase ASCII). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
