/** Stamp new/updated records with version metadata for sync merge. */
export function withSyncMetadata<T extends Record<string, unknown>>(
  record: T,
  existingVersion?: number
): T & { version: number; updated_at: string } {
  return {
    ...record,
    version: (existingVersion ?? 0) + 1,
    updated_at: new Date().toISOString(),
  };
}
