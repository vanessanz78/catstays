import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Printer,
  RefreshCw,
  Search,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings, type BookingWithDetails } from "@/hooks/useBookings";
import { supabase } from "@/utils/supabase/client";
import { fetchAllRowsById } from "@/app/lib/fetchAllRows";
import {
  DEPOSIT_STATUS_OPTIONS,
  depositReportStatus,
  filterReportRows,
  normaliseStatus,
  sortReportRows,
  toggleSort,
  type ReportColumn,
  type ReportKey,
  type ReportRow,
  type SortDirection,
} from "@/app/lib/staffReports";
import { NotificationBell } from "../../components/NotificationBell";
import { RightMenu } from "../../components/RightMenu";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../components/ui/select";

type PaymentRecord = {
  id: string;
  booking_id: string | null;
  customer_id: string | null;
  amount: number;
  type: string | null;
  status: string | null;
  payment_method: string | null;
  paid_on: string | null;
  reference: string | null;
  created_at: string;
  external_source: string | null;
  external_id: string | null;
  legacy_invoice_id: string | null;
  customer: { name: string } | null;
  legacy_description: string | null;
  legacy_payment_type: string | null;
  legacy_deleted: boolean;
};

type PaymentRequest = {
  id: string;
  booking_id: string;
  customer_id: string | null;
  request_type: "deposit" | "full";
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
};

type CareCat = {
  id: string;
  customer_id: string;
  name: string;
  breed: string | null;
  age: string | null;
  medical_notes: string | null;
  dietary_requirements: string | null;
  created_at: string;
  customer: { name: string; email: string } | null;
};

type ReportDefinition = {
  key: ReportKey;
  label: string;
  description: string;
  group: "Daily operations" | "Money" | "Customers & care";
  columns: ReportColumn[];
  emptyMessage?: string;
};

const REPORTS: ReportDefinition[] = [
  {
    key: "arrivals",
    label: "Arrivals",
    description: "Who is checking in and when.",
    group: "Daily operations",
    columns: [
      { key: "arrival", label: "Arrival", type: "date" },
      { key: "time", label: "Time" },
      { key: "customer", label: "Customer" },
      { key: "cats", label: "Cats" },
      { key: "room", label: "Room" },
      { key: "status", label: "Status" },
    ],
  },
  {
    key: "departures",
    label: "Departures",
    description: "Who is checking out and when.",
    group: "Daily operations",
    columns: [
      { key: "departure", label: "Departure", type: "date" },
      { key: "time", label: "Time" },
      { key: "customer", label: "Customer" },
      { key: "cats", label: "Cats" },
      { key: "room", label: "Room" },
      { key: "status", label: "Status" },
    ],
  },
  {
    key: "bookings",
    label: "Bookings",
    description: "All bookings, values, rooms, and status.",
    group: "Daily operations",
    columns: [
      { key: "created", label: "Created", type: "date" },
      { key: "reference", label: "Reference" },
      { key: "customer", label: "Customer" },
      { key: "cats", label: "Cats" },
      { key: "stay", label: "Stay dates" },
      { key: "room", label: "Room" },
      { key: "status", label: "Status" },
      { key: "total", label: "Total", type: "money" },
    ],
  },
  {
    key: "cancellations",
    label: "Cancelled bookings",
    description: "Cancellation reasons, notes, payments, retained value, and customer credit.",
    group: "Daily operations",
    columns: [
      { key: "cancelled", label: "Cancelled", type: "date" },
      { key: "reference", label: "Reference" },
      { key: "customer", label: "Customer" },
      { key: "cats", label: "Cats" },
      { key: "stay", label: "Stay dates" },
      { key: "reason", label: "Reason" },
      { key: "note", label: "Note" },
      { key: "received", label: "Paid", type: "money" },
      { key: "credit", label: "Customer credit", type: "money" },
      { key: "retained", label: "Retained", type: "money" },
    ],
  },
  {
    key: "occupancy",
    label: "Occupancy",
    description: "Occupied rooms and nights by stay.",
    group: "Daily operations",
    columns: [
      { key: "arrival", label: "Arrival", type: "date" },
      { key: "departure", label: "Departure", type: "date" },
      { key: "room", label: "Room" },
      { key: "customer", label: "Customer" },
      { key: "cats", label: "Cats" },
      { key: "nights", label: "Nights", type: "number" },
      { key: "status", label: "Status" },
    ],
  },
  {
    key: "appointments",
    label: "Appointments",
    description: "Arrival and collection appointments.",
    group: "Daily operations",
    columns: [
      { key: "date", label: "Date", type: "date" },
      { key: "type", label: "Appointment" },
      { key: "time", label: "Time" },
      { key: "customer", label: "Customer" },
      { key: "cats", label: "Cats" },
      { key: "status", label: "Status" },
    ],
  },
  {
    key: "training",
    label: "Training",
    description: "Staff training and activity records.",
    group: "Daily operations",
    columns: [
      { key: "date", label: "Date", type: "date" },
      { key: "team", label: "Team member" },
      { key: "training", label: "Training" },
      { key: "status", label: "Status" },
    ],
    emptyMessage:
      "Training records will appear here once structured staff training is added.",
  },
  {
    key: "deposits",
    label: "Deposit payments",
    description: "Requested, paid, refunded, and outstanding deposits.",
    group: "Money",
    columns: [
      { key: "created", label: "Deposit created", type: "date" },
      { key: "reference", label: "Reference" },
      { key: "customer", label: "Customer" },
      { key: "cats", label: "Cats" },
      { key: "stay", label: "Booking dates" },
      { key: "room", label: "Room" },
      { key: "amount", label: "Deposit amount", type: "money" },
      { key: "status", label: "Status" },
      { key: "bookingStatus", label: "Booking status" },
      { key: "received", label: "Monies received", type: "money" },
      { key: "outstanding", label: "Outstanding", type: "money" },
    ],
  },
  {
    key: "outstanding",
    label: "Outstanding payments",
    description: "Bookings that still have money owing.",
    group: "Money",
    columns: [
      { key: "arrival", label: "Arrival", type: "date" },
      { key: "reference", label: "Reference" },
      { key: "customer", label: "Customer" },
      { key: "cats", label: "Cats" },
      { key: "total", label: "Booking total", type: "money" },
      { key: "received", label: "Received", type: "money" },
      { key: "outstanding", label: "Outstanding", type: "money" },
      { key: "status", label: "Payment status" },
    ],
  },
  {
    key: "sales",
    label: "Sales",
    description: "Booking revenue and collection progress.",
    group: "Money",
    columns: [
      { key: "created", label: "Created", type: "date" },
      { key: "reference", label: "Reference" },
      { key: "customer", label: "Customer" },
      { key: "cats", label: "Cats" },
      { key: "status", label: "Booking status" },
      { key: "total", label: "Sale", type: "money" },
      { key: "received", label: "Received", type: "money" },
      { key: "outstanding", label: "Outstanding", type: "money" },
    ],
  },
  {
    key: "payments",
    label: "Payments",
    description: "Every recorded customer payment.",
    group: "Money",
    columns: [
      { key: "date", label: "Date", type: "date" },
      { key: "reference", label: "Reference" },
      { key: "booking", label: "Booking" },
      { key: "customer", label: "Customer" },
      { key: "method", label: "Method" },
      { key: "type", label: "Type" },
      { key: "status", label: "Status" },
      { key: "amount", label: "Amount", type: "money" },
    ],
  },
  {
    key: "birthdays",
    label: "Birthdays",
    description: "Upcoming cat birthdays.",
    group: "Customers & care",
    columns: [
      { key: "date", label: "Birthday", type: "date" },
      { key: "cat", label: "Cat" },
      { key: "customer", label: "Customer" },
      { key: "age", label: "Age" },
    ],
    emptyMessage:
      "Birthdays will appear here when exact dates of birth are saved on cat profiles.",
  },
  {
    key: "vaccine-expiry",
    label: "Vaccine expiry",
    description: "Vaccination records that need attention.",
    group: "Customers & care",
    columns: [
      { key: "date", label: "Expiry date", type: "date" },
      { key: "cat", label: "Cat" },
      { key: "customer", label: "Customer" },
      { key: "status", label: "Status" },
    ],
    emptyMessage:
      "Vaccine expiry dates will appear here when structured vaccination records are saved.",
  },
  {
    key: "feeding-medical",
    label: "Feeding & medical",
    description: "Dietary and medical care notes by cat.",
    group: "Customers & care",
    columns: [
      { key: "added", label: "Added", type: "date" },
      { key: "cat", label: "Cat" },
      { key: "customer", label: "Customer" },
      { key: "breed", label: "Breed" },
      { key: "feeding", label: "Feeding" },
      { key: "medical", label: "Medical" },
    ],
  },
  {
    key: "waiting-list",
    label: "Waiting list",
    description: "Customers and cats waiting for a room.",
    group: "Customers & care",
    columns: [
      { key: "created", label: "Added", type: "date" },
      { key: "customer", label: "Customer" },
      { key: "cats", label: "Cats" },
      { key: "stay", label: "Requested dates" },
      { key: "room", label: "Room" },
      { key: "status", label: "Status" },
    ],
  },
  {
    key: "tips",
    label: "Tips",
    description: "Tips received with customer payments.",
    group: "Money",
    columns: [
      { key: "date", label: "Date", type: "date" },
      { key: "customer", label: "Customer" },
      { key: "booking", label: "Booking" },
      { key: "method", label: "Method" },
      { key: "status", label: "Status" },
      { key: "amount", label: "Tip", type: "money" },
    ],
  },
];

const GROUPS = ["Daily operations", "Money", "Customers & care"] as const;

function customerName(booking: BookingWithDetails | undefined) {
  return booking?.customer?.name || booking?.legacy_customer_name || booking?.guest_name || "Customer";
}

function catNames(booking: BookingWithDetails | undefined) {
  if (!booking) return "Cat guest";
  const names = booking.booking_cats
    .map((entry) => entry.cat?.name)
    .filter(Boolean);
  return names.length
    ? names.join(", ")
    : booking.legacy_pet_names || booking.cat_names || "Cat guest";
}

function roomName(booking: BookingWithDetails | undefined) {
  if (!booking) return "Unassigned";
  const segmentRooms = booking.booking_room_segments.map(
    (segment) => `${segment.room.name} ${segment.room_unit_number}`,
  );
  if (segmentRooms.length) return [...new Set(segmentRooms)].join(", ");
  if (booking.room) {
    return `${booking.room.name}${booking.room_unit_number ? ` ${booking.room_unit_number}` : ""}`;
  }
  return booking.legacy_run_name || "Unassigned";
}

function bookingReference(booking: BookingWithDetails | undefined) {
  return booking
    ? booking.legacy_reference || booking.id.slice(0, 8).toUpperCase()
    : "—";
}

function numberOfNights(start: string, end: string) {
  const startTime = new Date(`${start}T12:00:00`).getTime();
  const endTime = new Date(`${end}T12:00:00`).getTime();
  return Math.max(1, Math.round((endTime - startTime) / 86_400_000));
}

function money(value: number) {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
  }).format(Number(value || 0));
}

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-NZ", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function htmlCell(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function valueForDisplay(value: unknown, column: ReportColumn) {
  if (value === null || value === undefined || value === "") return "—";
  if (column.type === "money") return money(Number(value));
  if (column.type === "date") return formatDate(String(value));
  return String(value);
}

export function AdminReports() {
  const { cattery } = useAuth();
  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    refetch,
  } = useBookings({ allPages: true });
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [careCats, setCareCats] = useState<CareCat[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(true);
  const [ledgerError, setLedgerError] = useState("");
  const [activeKey, setActiveKey] = useState<ReportKey>("arrivals");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [includeDeletedLegacyPayments, setIncludeDeletedLegacyPayments] =
    useState(false);
  const [sort, setSort] = useState<{ key: string; direction: SortDirection }>({
    key: "arrival",
    direction: "asc",
  });
  const [toolNotice, setToolNotice] = useState("");
  const [page, setPage] = useState(0);
  const [printing, setPrinting] = useState(false);

  const loadReportData = async () => {
    if (!cattery?.id) {
      setPayments([]);
      setRequests([]);
      setCareCats([]);
      setLedgerLoading(false);
      return;
    }
    setLedgerLoading(true);
    setLedgerError("");
    const readRows = <T extends { id: string }>(table: string, fields: string) =>
      fetchAllRowsById<T>((afterId, limit) => {
        let query = supabase.from(table).select(fields).eq('cattery_id', cattery.id).order('id').limit(limit);
        if (afterId) query = query.gt('id', afterId);
        return query.returns<T[]>();
      }, () => supabase.from(table).select('id', { count: 'exact', head: true }).eq('cattery_id', cattery.id));
    const [paymentsResult, requestsResult, catsResult] = await Promise.all([
      readRows<PaymentRecord>('payments', 'id,booking_id,customer_id,amount,type,status,payment_method,paid_on,reference,created_at,customer:customers(name),legacy_invoice_id,external_source,external_id,legacy_description,legacy_payment_type,legacy_deleted'),
      readRows<PaymentRequest>('payment_requests', 'id,booking_id,customer_id,request_type,amount,status,paid_at,created_at'),
      readRows<CareCat>('cats', 'id,customer_id,name,breed,age,medical_notes,dietary_requirements,created_at,customer:customers(name,email)'),
    ]);
    const errors = [
      paymentsResult.error && `Payments: ${paymentsResult.error.message}`,
      requestsResult.error && `Payment requests: ${requestsResult.error.message}`,
      catsResult.error && `Cat care: ${catsResult.error.message}`,
    ].filter(Boolean);
    setPayments((paymentsResult.data || []) as unknown as PaymentRecord[]);
    setRequests((requestsResult.data || []) as PaymentRequest[]);
    setCareCats((catsResult.data || []) as unknown as CareCat[]);
    setLedgerError(errors.join(" "));
    setLedgerLoading(false);
  };

  useEffect(() => {
    void loadReportData();
  }, [cattery?.id]);

  const activeReport =
    REPORTS.find((report) => report.key === activeKey) || REPORTS[0];
  const bookingById = useMemo(
    () => new Map(bookings.map((booking) => [booking.id, booking])),
    [bookings],
  );
  const customerById = useMemo(() => {
    const map = new Map<string, string>();
    bookings.forEach((booking) => {
      if (booking.customer?.id)
        map.set(booking.customer.id, customerName(booking));
    });
    careCats.forEach((cat) => {
      if (cat.customer_id && cat.customer?.name)
        map.set(cat.customer_id, cat.customer.name);
    });
    return map;
  }, [bookings, careCats]);
  const paymentsByBooking = useMemo(() => {
    const map = new Map<string, PaymentRecord[]>();
    payments.forEach((payment) => {
      if (!payment.booking_id) return;
      map.set(payment.booking_id, [
        ...(map.get(payment.booking_id) || []),
        payment,
      ]);
    });
    return map;
  }, [payments]);

  const bookingMoney = (booking: BookingWithDetails) => {
    if (booking.external_source === "revelation_pets") {
      const received = Number(booking.legacy_monies_received || 0);
      const outstanding = Number(booking.legacy_outstanding || 0);
      return { total: received + outstanding, received, outstanding };
    }
    const bookingPayments = paymentsByBooking.get(booking.id) || [];
    const received = bookingPayments
      .filter((payment) => payment.status === "completed")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const total =
      Number(booking.total_amount || 0) +
      booking.booking_adjustments.reduce(
        (sum, adjustment) => sum + Number(adjustment.amount || 0),
        0,
      );
    return { total, received, outstanding: Math.max(0, total - received) };
  };

  const rows = useMemo<ReportRow[]>(() => {
    const activeBookings = bookings.filter(
      (booking) => booking.status !== "cancelled",
    );
    const bookingRows = (
      dateField: "check_in" | "check_out",
      valueKey: "arrival" | "departure",
    ) =>
      activeBookings.map((booking) => ({
        id: `${activeKey}-${booking.id}`,
        date: booking[dateField],
        status: normaliseStatus(booking.status),
        values: {
          [valueKey]: booking[dateField],
          time:
            dateField === "check_in"
              ? booking.check_in_time
              : booking.check_out_time,
          customer: customerName(booking),
          cats: catNames(booking),
          room: roomName(booking),
          status: normaliseStatus(booking.status),
        },
      }));

    if (activeKey === "arrivals") return bookingRows("check_in", "arrival");
    if (activeKey === "departures")
      return bookingRows("check_out", "departure");
    if (activeKey === "bookings")
      return bookings.map((booking) => ({
        id: booking.id,
        date: booking.created_at,
        status: normaliseStatus(booking.status),
        bookingStatus: normaliseStatus(booking.status),
        values: {
          created: booking.created_at,
          reference: bookingReference(booking),
          customer: customerName(booking),
          cats: catNames(booking),
          stay: `${formatDate(booking.check_in)} – ${formatDate(booking.check_out)}`,
          room: roomName(booking),
          status: normaliseStatus(booking.status),
          total: bookingMoney(booking).total,
        },
      }));
    if (activeKey === "cancellations")
      return bookings
        .filter((booking) => booking.status === "cancelled")
        .map((booking) => {
          const financials = bookingMoney(booking);
          const credit = Number(booking.cancellation_credit_amount || 0);
          return {
            id: booking.id,
            date: booking.cancelled_at || booking.created_at,
            status: booking.cancellation_reason || "Cancelled",
            bookingStatus: "Cancelled",
            values: {
              cancelled: booking.cancelled_at || booking.created_at,
              reference: bookingReference(booking),
              customer: customerName(booking),
              cats: catNames(booking),
              stay: `${formatDate(booking.check_in)} – ${formatDate(booking.check_out)}`,
              reason: booking.cancellation_reason || "Not recorded",
              note: booking.cancellation_note || "—",
              received: financials.received,
              credit,
              retained: Math.max(0, financials.received - credit),
            },
          };
        });
    if (activeKey === "occupancy")
      return activeBookings.map((booking) => ({
        id: booking.id,
        date: booking.check_in,
        status: normaliseStatus(booking.status),
        values: {
          arrival: booking.check_in,
          departure: booking.check_out,
          room: roomName(booking),
          customer: customerName(booking),
          cats: catNames(booking),
          nights: numberOfNights(booking.check_in, booking.check_out),
          status: normaliseStatus(booking.status),
        },
      }));
    if (activeKey === "appointments")
      return activeBookings.flatMap((booking) => [
        {
          id: `${booking.id}-arrival`,
          date: booking.check_in,
          status: normaliseStatus(booking.status),
          values: {
            date: booking.check_in,
            type: "Arrival",
            time: booking.check_in_time,
            customer: customerName(booking),
            cats: catNames(booking),
            status: normaliseStatus(booking.status),
          },
        },
        {
          id: `${booking.id}-departure`,
          date: booking.check_out,
          status: normaliseStatus(booking.status),
          values: {
            date: booking.check_out,
            type: "Collection",
            time: booking.check_out_time,
            customer: customerName(booking),
            cats: catNames(booking),
            status: normaliseStatus(booking.status),
          },
        },
      ]);
    if (activeKey === "deposits")
      return requests
        .filter((request) => request.request_type === "deposit")
        .map((request) => {
          const booking = bookingById.get(request.booking_id);
          const bookingPayments =
            paymentsByBooking.get(request.booking_id) || [];
          const received = bookingPayments
            .filter((payment) => payment.status === "completed")
            .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
          const status = depositReportStatus({
            requestStatus: request.status,
            bookingStatus: booking?.status,
            requested: Number(request.amount),
            received,
            refunded: bookingPayments.some(
              (payment) => payment.status === "refunded",
            ),
          });
          const bookingStatus =
            booking?.status === "cancelled" ? "Cancelled" : "Not cancelled";
          return {
            id: request.id,
            date: request.created_at,
            status,
            bookingStatus,
            values: {
              created: request.created_at,
              reference: bookingReference(booking),
              customer: customerName(booking),
              cats: catNames(booking),
              stay: booking
                ? `${formatDate(booking.check_in)} – ${formatDate(booking.check_out)}`
                : "—",
              room: roomName(booking),
              amount: Number(request.amount),
              status,
              bookingStatus,
              received,
              outstanding: Number(request.amount) - received,
            },
          };
        });
    if (activeKey === "outstanding")
      return activeBookings.flatMap((booking) => {
        const financials = bookingMoney(booking);
        return financials.outstanding <= 0
          ? []
          : [
              {
                id: booking.id,
                date: booking.check_in,
                status: normaliseStatus(booking.payment_status || "unpaid"),
                values: {
                  arrival: booking.check_in,
                  reference: bookingReference(booking),
                  customer: customerName(booking),
                  cats: catNames(booking),
                  total: financials.total,
                  received: financials.received,
                  outstanding: financials.outstanding,
                  status: normaliseStatus(booking.payment_status || "unpaid"),
                },
              },
            ];
      });
    if (activeKey === "sales")
      return activeBookings.map((booking) => {
        const financials = bookingMoney(booking);
        return {
          id: booking.id,
          date: booking.created_at,
          status: normaliseStatus(booking.status),
          values: {
            created: booking.created_at,
            reference: bookingReference(booking),
            customer: customerName(booking),
            cats: catNames(booking),
            status: normaliseStatus(booking.status),
            total: financials.total,
            received: financials.received,
            outstanding: financials.outstanding,
          },
        };
      });
    if (activeKey === "payments" || activeKey === "tips")
      return payments
        .filter(
          (payment) =>
            (includeDeletedLegacyPayments || !payment.legacy_deleted) &&
            (activeKey !== "tips" || payment.type === "tip"),
        )
        .map((payment) => {
          const booking = payment.booking_id
            ? bookingById.get(payment.booking_id)
            : undefined;
          return {
            id: payment.id,
            date: payment.paid_on || payment.created_at,
            status: normaliseStatus(payment.status),
            values: {
              date: payment.paid_on || payment.created_at,
              reference: payment.reference || "—",
              booking: booking ? bookingReference(booking) : payment.legacy_invoice_id || '—',
              customer: booking
                ? customerName(booking)
                : payment.customer?.name || customerById.get(payment.customer_id || "") || "Customer",
              method: normaliseStatus(
                payment.legacy_payment_type || payment.payment_method,
              ),
              type: normaliseStatus(
                payment.legacy_description || payment.type,
              ),
              status: normaliseStatus(payment.status),
              amount: Number(payment.amount),
            },
          };
        });
    if (activeKey === "feeding-medical")
      return careCats
        .filter((cat) => cat.dietary_requirements || cat.medical_notes)
        .map((cat) => ({
          id: cat.id,
          date: cat.created_at,
          status: "Care note",
          values: {
            added: cat.created_at,
            cat: cat.name,
            customer: cat.customer?.name || "Customer",
            breed: cat.breed,
            feeding: cat.dietary_requirements,
            medical: cat.medical_notes,
          },
        }));
    if (activeKey === "waiting-list")
      return bookings
        .filter((booking) => booking.status === "waitlist")
        .map((booking) => ({
          id: booking.id,
          date: booking.created_at,
          status: "Waitlist",
          values: {
            created: booking.created_at,
            customer: customerName(booking),
            cats: catNames(booking),
            stay: `${formatDate(booking.check_in)} – ${formatDate(booking.check_out)}`,
            room: roomName(booking),
            status: "Waitlist",
          },
        }));
    return [];
  }, [
    activeKey,
    bookings,
    careCats,
    requests,
    payments,
    bookingById,
    customerById,
    paymentsByBooking,
    includeDeletedLegacyPayments,
  ]);

  const statusOptions = useMemo(
    () =>
      activeKey === "deposits"
        ? [...DEPOSIT_STATUS_OPTIONS]
        : [...new Set(rows.map((row) => row.status).filter(Boolean))].sort(),
    [activeKey, rows],
  );

  const visibleRows = useMemo(
    () =>
      sortReportRows(
        filterReportRows(rows, {
          from,
          to,
          statuses: selectedStatuses,
          search,
        }),
        activeReport.columns,
        sort.key,
        sort.direction,
      ),
    [rows, from, to, selectedStatuses, search, activeReport, sort],
  );

  const reportValue = useMemo(() => {
    const moneyColumn = activeReport.columns.find(
      (column) =>
        ["amount", "total", "outstanding", "received"].includes(column.key) &&
        column.type === "money",
    );
    return moneyColumn
      ? visibleRows.reduce(
          (sum, row) => sum + Number(row.values[moneyColumn.key] || 0),
          0,
        )
      : null;
  }, [activeReport, visibleRows]);

  useEffect(() => { setPage(0); }, [activeKey, from, to, search, selectedStatuses, sort]);
  const pageCount = Math.max(1, Math.ceil(visibleRows.length / 50));
  const currentPage = Math.min(page, pageCount - 1);
  const displayRows = printing ? visibleRows : visibleRows.slice(currentPage * 50, (currentPage + 1) * 50);

  const chooseReport = (key: ReportKey) => {
    const report =
      REPORTS.find((candidate) => candidate.key === key) || REPORTS[0];
    setActiveKey(key);
    setSelectedStatuses([]);
    setSearch("");
    setSort({ key: report.columns[0]?.key || "", direction: "asc" });
  };

  const printReport = (saveAsPdf = false) => {
    const oldTitle = document.title;
    document.title = `CatStays ${activeReport.label} report`;
    if (saveAsPdf) setToolNotice("In the print window, choose “Save as PDF”.");
    flushSync(() => setPrinting(true));
    window.print();
    setPrinting(false);
    window.setTimeout(() => {
      document.title = oldTitle;
    }, 500);
  };

  const exportExcel = () => {
    const header = activeReport.columns
      .map((column) => `<th>${htmlCell(column.label)}</th>`)
      .join("");
    const body = visibleRows
      .map(
        (row) =>
          `<tr>${activeReport.columns.map((column) => `<td>${htmlCell(valueForDisplay(row.values[column.key], column))}</td>`).join("")}</tr>`,
      )
      .join("");
    const workbook = `\ufeff<html><head><meta charset="utf-8"></head><body><h1>${htmlCell(activeReport.label)} report</h1><p>${htmlCell(from || "All dates")} to ${htmlCell(to || "today")}</p><table border="1"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></body></html>`;
    const blob = new Blob([workbook], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `catstays-${activeKey}-${from || "all"}-${to || localDateKey(new Date())}.xls`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setToolNotice(
      `Exported ${visibleRows.length} visible row${visibleRows.length === 1 ? "" : "s"} for Excel.`,
    );
  };

  const isLoading = bookingsLoading || ledgerLoading;
  const error = bookingsError || ledgerError;
  const unavailable = ["training", "birthdays", "vaccine-expiry"].includes(activeKey);

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#0A1128] lg:flex">
      <style>{`@media print { body * { visibility: hidden !important; } #report-print-area, #report-print-area * { visibility: visible !important; } #report-print-area { position: absolute; inset: 0; width: 100%; background: white; padding: 20px; } .report-no-print { display: none !important; } }`}</style>
      <RightMenu mode="sidebar" />
      <div className="min-w-0 flex-1">
        <header className="report-no-print sticky top-0 z-30 border-b border-[#E8DED4] bg-white/95 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <RightMenu />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">
                  Staff dashboard
                </p>
                <h1 className="text-xl font-semibold">
                  {cattery?.name || "Your cattery"}
                </h1>
              </div>
            </div>
            <NotificationBell />
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 pb-24">
          <div className="report-no-print mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">
                Operations and finance
              </p>
              <h2 className="text-3xl font-semibold">Reports</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#4E5871]">
                Explore live cattery records, sort every column, focus the date
                and status, then print or export exactly what is showing.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                void refetch();
                void loadReportData();
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          {error && (
            <div
              role="alert"
              className="report-no-print mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              Some report data could not be loaded: {error}
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="report-no-print hidden self-start rounded-2xl border border-[#E8DED4] bg-white p-3 shadow-sm xl:block">
              {GROUPS.map((group) => (
                <div key={group} className="mb-4 last:mb-0">
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#768098]">
                    {group}
                  </p>
                  {REPORTS.filter((report) => report.group === group).map(
                    (report) => (
                      <button
                        key={report.key}
                        type="button"
                        onClick={() => chooseReport(report.key)}
                        className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${activeKey === report.key ? "bg-[#0A1128] text-white shadow-sm" : "text-[#2D3E2F] hover:bg-[#F6F2EA]"}`}
                      >
                        <FileText
                          className={`h-4 w-4 shrink-0 ${activeKey === report.key ? "text-[#F2B38B]" : "text-[#C46A3A]"}`}
                        />
                        <span className="text-sm font-semibold">
                          {report.label}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              ))}
            </aside>

            <section className="min-w-0 space-y-5">
              <label className="report-no-print block xl:hidden">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B7A6D]">
                  Choose report
                </span>
                <Select
                  value={activeKey}
                  onValueChange={(value) =>
                    chooseReport(value as ReportKey)
                  }
                >
                  <SelectTrigger aria-label="Choose report" className="h-12 w-full rounded-xl border-[#D8D1C8] bg-white font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[min(24rem,60vh)] rounded-xl border-[#D8D1C8] bg-white text-[#0A1128] shadow-xl">
                  {GROUPS.map((group) => (
                    <SelectGroup key={group}>
                      <SelectLabel className="text-[#6B7A6D]">{group}</SelectLabel>
                      {REPORTS.filter((report) => report.group === group).map(
                        (report) => (
                          <SelectItem key={report.key} value={report.key} className="min-h-11 rounded-lg focus:bg-[#F6F2EA] focus:text-[#0A1128]">
                            {report.label}
                          </SelectItem>
                        ),
                      )}
                    </SelectGroup>
                  ))}
                  </SelectContent>
                </Select>
              </label>

              <div className="report-no-print rounded-2xl border border-[#E8DED4] bg-white p-4 shadow-sm">
                <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_auto_auto_auto] lg:items-end">
                  <label>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B7A6D]">
                      Search this report
                    </span>
                    <span className="relative block">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-[#768098]" />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Customer, cat, reference…"
                        className="h-11 w-full rounded-lg border border-[#D8D1C8] pl-10 pr-3 text-sm"
                      />
                    </span>
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B7A6D]">
                      From
                    </span>
                    <input
                      type="date"
                      value={from}
                      onInput={(event) => setFrom(event.currentTarget.value)}
                      className="h-11 w-full rounded-lg border border-[#D8D1C8] px-3 text-sm"
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B7A6D]">
                      To
                    </span>
                    <input
                      type="date"
                      value={to}
                      onInput={(event) => setTo(event.currentTarget.value)}
                      className="h-11 w-full rounded-lg border border-[#D8D1C8] px-3 text-sm"
                    />
                  </label>
                  <details className="relative">
                    <summary className="flex h-11 cursor-pointer list-none items-center justify-center rounded-lg border border-[#D8D1C8] bg-white px-4 text-sm font-semibold">
                      Status
                      {selectedStatuses.length
                        ? ` (${selectedStatuses.length})`
                        : ""}
                    </summary>
                    <div className="absolute right-0 z-20 mt-2 min-w-64 rounded-xl border border-[#E8DED4] bg-white p-3 shadow-xl">
                      {statusOptions.length ? (
                        statusOptions.map((status) => (
                          <label
                            key={status}
                            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-[#F6F2EA]"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStatuses.includes(status)}
                              onChange={() =>
                                setSelectedStatuses((current) =>
                                  current.includes(status)
                                    ? current.filter(
                                        (value) => value !== status,
                                      )
                                    : [...current, status],
                                )
                              }
                              className="h-4 w-4 accent-[#C46A3A]"
                            />
                            <span className="text-sm">{status}</span>
                          </label>
                        ))
                      ) : (
                        <p className="p-2 text-sm text-[#768098]">
                          No statuses in this report yet.
                        </p>
                      )}
                      {selectedStatuses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedStatuses([])}
                          className="mt-2 w-full border-t pt-3 text-sm font-semibold text-[#C46A3A]"
                        >
                          Clear status filters
                        </button>
                      )}
                    </div>
                  </details>
                </div>
                {activeKey === "payments" && (
                  <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg bg-[#F6F2EA] px-3 py-2 text-sm text-[#4E5871]">
                    <input
                      type="checkbox"
                      checked={includeDeletedLegacyPayments}
                      onChange={(event) =>
                        setIncludeDeletedLegacyPayments(event.target.checked)
                      }
                      className="h-4 w-4 accent-[#C46A3A]"
                    />
                    Include payments that were deleted in Revelation Pets
                  </label>
                )}
              </div>

              <div id="report-print-area" className="space-y-5">
                <div className="rounded-2xl bg-[#0A1128] p-5 text-white shadow-sm md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#C46A3A]">
                        <BarChart3 className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F2B38B]">
                          CatStays report
                        </p>
                        <h3 className="mt-1 text-2xl font-semibold">
                          {activeReport.label}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                          {activeReport.description}
                        </p>
                      </div>
                    </div>
                    <div className="report-no-print flex flex-wrap gap-2">
                      <Button
                        onClick={() => printReport(false)}
                        disabled={isLoading || !!error || unavailable}
                        variant="outline"
                        className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                      <Button
                        onClick={() => printReport(true)}
                        disabled={isLoading || !!error || unavailable}
                        variant="outline"
                        className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Save PDF
                      </Button>
                      <Button
                        onClick={exportExcel}
                        disabled={isLoading || !!error || visibleRows.length === 0}
                        className="bg-[#C46A3A] text-white hover:bg-[#A85A30]"
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export Excel
                      </Button>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/60">
                        Records
                      </p>
                      <p className="mt-1 text-2xl font-semibold">
                        {visibleRows.length}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/60">
                        Date range
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {from ? formatDate(from) : "All dates"} –{" "}
                        {to ? formatDate(to) : "Today"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/60">
                        {reportValue === null
                          ? "Status filter"
                          : "Visible value"}
                      </p>
                      <p className="mt-1 text-2xl font-semibold">
                        {reportValue === null
                          ? selectedStatuses.length
                            ? selectedStatuses.length
                            : "All"
                          : money(reportValue)}
                      </p>
                    </div>
                  </div>
                </div>

                {toolNotice && (
                  <div className="report-no-print flex items-center justify-between rounded-xl border border-[#7DAF7B]/40 bg-[#EDF6EC] px-4 py-3 text-sm text-[#2D5830]">
                    <span>{toolNotice}</span>
                    <button
                      type="button"
                      onClick={() => setToolNotice("")}
                      className="font-semibold"
                    >
                      Close
                    </button>
                  </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-[#E8DED4] bg-white shadow-sm">
                  {isLoading ? (
                    <div className="grid min-h-64 place-items-center">
                      <div className="text-center">
                        <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#C46A3A]" />
                        <p className="mt-3 text-sm text-[#4E5871]">
                          Building the live report…
                        </p>
                      </div>
                    </div>
                  ) : error ? (
                    <p className="p-6 text-red-700">This report is unavailable until its data loads successfully. Please refresh to retry.</p>
                  ) : visibleRows.length === 0 ? (
                    <div className="grid min-h-64 place-items-center p-8 text-center">
                      <div>
                        <CalendarDays className="mx-auto h-9 w-9 text-[#C46A3A]" />
                        <h4 className="mt-3 text-lg font-semibold">
                          {unavailable ? "Report not yet connected" : "No records to show"}
                        </h4>
                        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#4E5871]">
                          {activeReport.emptyMessage ||
                            (rows.length
                              ? "Change the date, status, or search filters to see more records."
                              : `There are no ${activeReport.label.toLocaleLowerCase()} records yet.`)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="hidden overflow-x-auto md:block print:block">
                        <table className="w-full min-w-max border-collapse">
                          <thead className="bg-[#F3EEE7]">
                            <tr>
                              {activeReport.columns.map((column) => (
                                <th
                                  key={column.key}
                                  scope="col"
                                  className="border-b border-[#E8DED4] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#4E5871]"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSort((current) =>
                                        toggleSort(current, column.key),
                                      )
                                    }
                                    className="flex items-center gap-1.5 whitespace-nowrap"
                                  >
                                    {column.label}
                                    {sort.key === column.key ? (
                                      sort.direction === "asc" ? (
                                        <ArrowUp className="h-3.5 w-3.5 text-[#C46A3A]" />
                                      ) : (
                                        <ArrowDown className="h-3.5 w-3.5 text-[#C46A3A]" />
                                      )
                                    ) : (
                                      <span className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {displayRows.map((row, index) => (
                              <tr
                                key={row.id}
                                className={
                                  index % 2 ? "bg-[#FBFAF8]" : "bg-white"
                                }
                              >
                                {activeReport.columns.map((column) => (
                                  <td
                                    key={column.key}
                                    className={`border-b border-[#EEE8E2] px-4 py-4 text-sm ${column.type === "money" || column.type === "number" ? "font-semibold tabular-nums" : ""}`}
                                  >
                                    {column.key === "status" ? (
                                      <Badge className="bg-[#E8F2E7] text-[#2D5830] hover:bg-[#E8F2E7]">
                                        {valueForDisplay(
                                          row.values[column.key],
                                          column,
                                        )}
                                      </Badge>
                                    ) : (
                                      valueForDisplay(
                                        row.values[column.key],
                                        column,
                                      )
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="report-no-print border-b border-[#E8DED4] bg-[#F8F7F5] p-4 md:hidden">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                          <label>
                            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B7A6D]">
                              Sort by
                            </span>
                            <Select
                              value={sort.key}
                              onValueChange={(key) => setSort({ key, direction: "asc" })}
                            >
                              <SelectTrigger aria-label="Sort by" className="h-11 rounded-lg border-[#D8D1C8] bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-xl bg-white text-[#0A1128]">
                              {activeReport.columns.map((column) => (
                                <SelectItem key={column.key} value={column.key} className="min-h-11">{column.label}</SelectItem>
                              ))}
                              </SelectContent>
                            </Select>
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSort((current) => ({
                              ...current,
                              direction: current.direction === "asc" ? "desc" : "asc",
                            }))}
                            className="mt-5 h-11 px-3"
                            aria-label={`Sort ${sort.direction === "asc" ? "descending" : "ascending"}`}
                          >
                            {sort.direction === "asc" ? <ArrowUp className="mr-2 h-4 w-4" /> : <ArrowDown className="mr-2 h-4 w-4" />}
                            {sort.direction === "asc" ? "Lowest first" : "Highest first"}
                          </Button>
                        </div>
                      </div>
                      <div className="divide-y divide-[#E8DED4] md:hidden print:hidden">
                        {displayRows.map((row) => (
                          <article key={row.id} className="p-4">
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                              {activeReport.columns.map((column) => (
                                <div
                                  key={column.key}
                                  className={
                                    ["stay", "feeding", "medical"].includes(
                                      column.key,
                                    )
                                      ? "col-span-2"
                                      : ""
                                  }
                                >
                                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#768098]">
                                    {column.label}
                                  </dt>
                                  <dd
                                    className={`mt-1 text-sm ${column.type === "money" || column.type === "number" ? "font-semibold tabular-nums" : ""}`}
                                  >
                                    {valueForDisplay(
                                      row.values[column.key],
                                      column,
                                    )}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </article>
                        ))}
                      </div>
                      <div className="report-no-print flex items-center justify-between gap-2 border-t border-[#E8DED4] p-4">
                        <Button variant="outline" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</Button>
                        <span className="text-center text-xs">Page {currentPage + 1} of {pageCount}<br />Print and export include all {visibleRows.length} matching records.</span>
                        <Button variant="outline" disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}>Next</Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
