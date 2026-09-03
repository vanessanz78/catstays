import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../pages/admin/Reports.tsx', import.meta.url), 'utf8');

test('payment report uses existing customer relationship, not nonexistent payment column', () => {
  assert.match(source, /customer:customers\(name\),legacy_invoice_id/);
  assert.doesNotMatch(source, /created_at,legacy_customer_name/);
  assert.doesNotMatch(source, /payment\.legacy_customer_name/);
});

test('report and mobile sort pickers use styled accessible selects', () => {
  assert.doesNotMatch(source, /<select[\s>]/);
  assert.match(source, /SelectTrigger aria-label="Choose report"/);
  assert.match(source, /SelectTrigger aria-label="Sort by"/);
});

test('screen rows are bounded while exports retain complete filtered rows', () => {
  assert.match(source, /visibleRows\.slice\(currentPage \* 50, \(currentPage \+ 1\) \* 50\)/);
  assert.equal((source.match(/displayRows\.map/g) || []).length, 2);
  assert.match(source, /const body = visibleRows/);
  assert.match(source, /This report is unavailable until its data loads successfully/);
});
