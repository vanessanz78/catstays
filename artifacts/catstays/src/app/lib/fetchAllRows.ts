/** Fetch complete tenant-scoped reports without Supabase's default row truncation.
 * Callers must supply a stable order (including id) and an exact count.
 * Expensive nested queries can count separately, once, using the same scope.
 */
type QueryError = { message: string };
type CountResult = { count: number | null; error: QueryError | null };
type PageResult<T> = { data: T[] | null; error: QueryError | null; count?: number | null };

export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<PageResult<T>>,
  options: {
    pageSize?: number;
    concurrency?: number;
    count?: () => PromiseLike<CountResult>;
  } = {},
) {
  const size = options.pageSize ?? 500;
  const concurrency = options.concurrency ?? 4;
  try {
    if (!Number.isInteger(size) || size < 1 || !Number.isInteger(concurrency) || concurrency < 1) {
      throw new Error('Invalid report paging configuration.');
    }
    const counted = options.count ? await options.count() : null;
    if (counted?.error) return { data: null, error: counted.error };
    if (counted && counted.count == null) throw new Error('The report did not return a complete row count. Please refresh.');
    if (counted?.count === 0) return { data: [] as T[], error: null };

    const first = await page(0, size - 1);
    if (first.error) return { data: null, error: first.error };
    const total = counted?.count ?? first.count;
    if (total == null || !Number.isInteger(total) || total < 0) {
      throw new Error('The report did not return a complete row count. Please refresh.');
    }
    const rows: T[] = [];
    const append = (result: PageResult<T>, from: number) => {
      if (result.error) throw new Error(result.error.message);
      if ((result.count != null && result.count !== total) ||
          (result.data?.length ?? 0) !== Math.min(size, total - from)) {
        throw new Error('Records changed or the report was truncated while loading. Please refresh this report.');
      }
      rows.push(...(result.data || []));
    };
    append(first, 0);
    for (let from = rows.length; from < total;) {
      const starts = Array.from({ length: Math.min(concurrency, Math.ceil((total - from) / size)) }, (_, i) => from + i * size);
      const pages = await Promise.all(starts.map(start => page(start, start + size - 1)));
      pages.forEach((result, i) => append(result, starts[i]));
      from += starts.length * size;
    }
    if (rows.length !== total) throw new Error('Records changed while loading. Please refresh this report.');
    return { data: rows, error: null };
  } catch (error) {
    return { data: null, error: { message: error instanceof Error ? error.message : 'Unable to load the complete report.' } };
  }
}


/** Resolve the cheap parent IDs first, then fetch nested relations only for those IDs.
 * Deep OFFSET queries otherwise re-evaluate relationship RLS for discarded rows.
 * Every detail request must retain the same tenant filter as the identity query.
 */
export async function fetchRowsByIds<T extends { id: string }>(
  identities: () => PromiseLike<{ data: { id: string }[] | null; error: QueryError | null }>,
  details: (ids: string[]) => PromiseLike<PageResult<T>>,
  options: { batchSize?: number; concurrency?: number } = {},
) {
  const size = options.batchSize ?? 100;
  const concurrency = options.concurrency ?? 3;
  try {
    if (!Number.isInteger(size) || size < 1 || !Number.isInteger(concurrency) || concurrency < 1) {
      throw new Error('Invalid detail paging configuration.');
    }
    const snapshot = await identities();
    if (snapshot.error) return { data: null, error: snapshot.error };
    if (!snapshot.data) throw new Error('Booking identities could not be loaded.');
    const ids = snapshot.data.map(row => row.id);
    if (new Set(ids).size !== ids.length) {
      throw new Error('Records changed while loading. Please refresh this report.');
    }
    const result: T[] = [];
    for (let from = 0; from < ids.length; from += size * concurrency) {
      const chunks = Array.from(
        { length: Math.min(concurrency, Math.ceil((ids.length - from) / size)) },
        (_, i) => ids.slice(from + i * size, from + (i + 1) * size),
      );
      const pages = await Promise.all(chunks.map(chunk => details(chunk)));
      pages.forEach((page, i) => {
        if (page.error) throw new Error(page.error.message);
        const rows = page.data ?? [];
        const byId = new Map(rows.map(row => [row.id, row]));
        if (rows.length !== chunks[i].length || byId.size !== rows.length || chunks[i].some(id => !byId.has(id))) {
          throw new Error('Records changed or booking details were truncated. Please refresh this report.');
        }
        result.push(...chunks[i].map(id => byId.get(id)!));
      });
    }
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: { message: error instanceof Error ? error.message : 'Unable to load complete booking details.' } };
  }
}

/** Read parent identities with a unique ascending cursor, never an increasing OFFSET. */
export async function fetchAllRowsById<T extends { id: string }>(
  page: (afterId: string | null, limit: number) => PromiseLike<PageResult<T>>,
  count: () => PromiseLike<CountResult>,
  pageSize = 500,
) {
  try {
    if (!Number.isInteger(pageSize) || pageSize < 1) throw new Error('Invalid identity paging configuration.');
    const counted = await count();
    if (counted.error) return { data: null, error: counted.error };
    const total = counted.count;
    if (total == null || !Number.isInteger(total) || total < 0) throw new Error('A complete booking count is required.');
    const rows: T[] = [];
    let cursor: string | null = null;
    while (rows.length < total) {
      const result = await page(cursor, pageSize);
      if (result.error) return { data: null, error: result.error };
      if ((result.data?.length ?? 0) !== Math.min(pageSize, total - rows.length)) {
        throw new Error('Records changed or booking identities were truncated. Please refresh.');
      }
      for (const row of result.data!) {
        if (!row.id || (cursor !== null && row.id <= cursor)) {
          throw new Error('Booking identities are not in a unique stable order. Please refresh.');
        }
        cursor = row.id;
        rows.push(row);
      }
    }
    return { data: rows, error: null };
  } catch (error) {
    return { data: null, error: { message: error instanceof Error ? error.message : 'Unable to load booking identities.' } };
  }
}
