export type ReportKey =
  | "arrivals"
  | "departures"
  | "bookings"
  | "cancellations"
  | "occupancy"
  | "appointments"
  | "training"
  | "deposits"
  | "outstanding"
  | "sales"
  | "payments"
  | "birthdays"
  | "vaccine-expiry"
  | "feeding-medical"
  | "waiting-list"
  | "tips";

export type ReportValue = string | number | null;

export type ReportColumn = {
  key: string;
  label: string;
  type?: "text" | "date" | "money" | "number";
};

export type ReportRow = {
  id: string;
  date: string;
  status: string;
  bookingStatus?: string;
  values: Record<string, ReportValue>;
};

export type SortDirection = "asc" | "desc";

export const DEPOSIT_STATUS_OPTIONS = [
  "Outstanding",
  "Paid",
  "Refunded",
  "Booking cancelled",
  "Booking not cancelled",
] as const;

export function normaliseStatus(value: string | null | undefined) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function depositReportStatus(input: {
  requestStatus: string;
  bookingStatus?: string;
  received: number;
  requested: number;
  refunded?: boolean;
}) {
  if (input.refunded) return "Refunded";
  if (input.requestStatus === "paid" || input.received >= input.requested)
    return "Paid";
  return "Outstanding";
}

export function filterReportRows(
  rows: ReportRow[],
  filters: { from?: string; to?: string; statuses?: string[]; search?: string },
) {
  const search = filters.search?.trim().toLocaleLowerCase() || "";
  return rows.filter((row) => {
    const date = row.date.slice(0, 10);
    if (filters.from && date < filters.from) return false;
    if (filters.to && date > filters.to) return false;
    if (filters.statuses?.length) {
      const matchesStatus = filters.statuses.includes(row.status);
      const bookingFilter =
        row.bookingStatus === "Cancelled"
          ? filters.statuses.includes("Booking cancelled")
          : filters.statuses.includes("Booking not cancelled");
      if (!matchesStatus && !bookingFilter) return false;
    }
    if (search) {
      const haystack = Object.values(row.values).join(" ").toLocaleLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

function comparableValue(value: ReportValue, columnType: ReportColumn["type"]) {
  if (value === null || value === undefined || value === "") return null;
  if (columnType === "money" || columnType === "number") return Number(value);
  if (columnType === "date") {
    const time = new Date(String(value)).getTime();
    return Number.isNaN(time) ? String(value).toLocaleLowerCase() : time;
  }
  return String(value).toLocaleLowerCase();
}

export function sortReportRows(
  rows: ReportRow[],
  columns: ReportColumn[],
  sortKey: string,
  direction: SortDirection,
) {
  const column = columns.find((candidate) => candidate.key === sortKey);
  if (!column) return rows;
  const multiplier = direction === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    const leftValue = comparableValue(left.values[sortKey], column.type);
    const rightValue = comparableValue(right.values[sortKey], column.type);
    if (leftValue === null && rightValue === null) return 0;
    if (leftValue === null) return 1;
    if (rightValue === null) return -1;
    if (leftValue < rightValue) return -1 * multiplier;
    if (leftValue > rightValue) return 1 * multiplier;
    return 0;
  });
}

export function toggleSort(
  current: { key: string; direction: SortDirection },
  nextKey: string,
): { key: string; direction: SortDirection } {
  if (current.key !== nextKey) return { key: nextKey, direction: "asc" };
  return {
    key: nextKey,
    direction: current.direction === "asc" ? "desc" : "asc",
  };
}
