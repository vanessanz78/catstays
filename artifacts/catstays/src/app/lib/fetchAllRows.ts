/** Fetch complete tenant-scoped reports without Supabase's default row truncation.
 * Callers must supply a stable order (including id) and count: 'exact'.
 */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{
    data: T[] | null; error: { message: string } | null; count?: number | null;
  }>,
) {
  const size = 500;
  try {
    const first = await page(0, size - 1);
    if (first.error) return { data: null, error: first.error };
    const rows = [...(first.data || [])];
    if (first.count == null) throw new Error('The report did not return a complete row count. Please refresh.');
    for (let from = rows.length; from < first.count;) {
      if (from === 0 || (rows.length < size && rows.length < first.count)) {
        throw new Error('The report was truncated. Please refresh.');
      }
      const starts = Array.from({ length: Math.min(4, Math.ceil((first.count - from) / size)) }, (_, i) => from + i * size);
      const pages = await Promise.all(starts.map(start => page(start, start + size - 1)));
      for (const result of pages) {
        if (result.error) return { data: null, error: result.error };
        rows.push(...(result.data || []));
      }
      from += starts.length * size;
    }
    if (rows.length !== first.count) throw new Error('Records changed while loading. Please refresh this report.');
    return { data: rows, error: null };
  } catch (error) {
    return { data: null, error: { message: error instanceof Error ? error.message : 'Unable to load the complete report.' } };
  }
}
