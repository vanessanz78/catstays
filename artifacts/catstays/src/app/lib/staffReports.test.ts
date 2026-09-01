import assert from "node:assert/strict";
import test from "node:test";
import {
  depositReportStatus,
  filterReportRows,
  sortReportRows,
  toggleSort,
  type ReportColumn,
  type ReportRow,
} from "./staffReports";

const columns: ReportColumn[] = [
  { key: "date", label: "Date", type: "date" },
  { key: "amount", label: "Amount", type: "money" },
  { key: "customer", label: "Customer" },
];

const rows: ReportRow[] = [
  {
    id: "2",
    date: "2026-09-04",
    status: "Paid",
    bookingStatus: "Confirmed",
    values: { date: "2026-09-04", amount: 90, customer: "Zoe" },
  },
  {
    id: "1",
    date: "2026-09-01",
    status: "Outstanding",
    bookingStatus: "Cancelled",
    values: { date: "2026-09-01", amount: 20, customer: "Amy" },
  },
];

test("report headers sort ascending then descending", () => {
  assert.deepEqual(
    sortReportRows(rows, columns, "amount", "asc").map((row) => row.id),
    ["1", "2"],
  );
  assert.deepEqual(
    sortReportRows(rows, columns, "amount", "desc").map((row) => row.id),
    ["2", "1"],
  );
  assert.deepEqual(toggleSort({ key: "amount", direction: "asc" }, "amount"), {
    key: "amount",
    direction: "desc",
  });
  assert.deepEqual(
    toggleSort({ key: "amount", direction: "desc" }, "customer"),
    { key: "customer", direction: "asc" },
  );
});

test("date, status, booking status, and live search filters combine", () => {
  assert.deepEqual(
    filterReportRows(rows, { from: "2026-09-02" }).map((row) => row.id),
    ["2"],
  );
  assert.deepEqual(
    filterReportRows(rows, { statuses: ["Booking cancelled"] }).map(
      (row) => row.id,
    ),
    ["1"],
  );
  assert.deepEqual(
    filterReportRows(rows, { statuses: ["Paid"], search: "zoe" }).map(
      (row) => row.id,
    ),
    ["2"],
  );
});

test("deposit status prioritises refunds and recognises fully received requests", () => {
  assert.equal(
    depositReportStatus({ requestStatus: "paid", received: 0, requested: 50 }),
    "Paid",
  );
  assert.equal(
    depositReportStatus({
      requestStatus: "pending",
      received: 50,
      requested: 50,
    }),
    "Paid",
  );
  assert.equal(
    depositReportStatus({
      requestStatus: "pending",
      received: 0,
      requested: 50,
    }),
    "Outstanding",
  );
  assert.equal(
    depositReportStatus({
      requestStatus: "paid",
      received: 50,
      requested: 50,
      refunded: true,
    }),
    "Refunded",
  );
});
