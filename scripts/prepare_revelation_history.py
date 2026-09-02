#!/usr/bin/env python3
"""Prepare a lossless, reconciled Revelation Pets history archive.

The command never writes to CatStays or Supabase. It converts report workbooks
into checksummed JSONL source records and produces booking-link candidates for
review before any live import is authorised.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import re
from collections import Counter, defaultdict
from datetime import date, datetime
from pathlib import Path
from typing import Any, Iterable

import pandas as pd


def clean(value: Any) -> str:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return ""
    if isinstance(value, pd.Timestamp):
        return value.isoformat()
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def decimal(value: Any) -> float:
    text = clean(value).replace("$", "").replace(",", "")
    if not text:
        return 0.0
    try:
        return round(float(text), 2)
    except ValueError:
        return 0.0


def normalize_name(value: Any) -> str:
    return re.sub(r"\s+", " ", clean(value)).casefold()


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def json_value(value: Any) -> Any:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return None
    if isinstance(value, (pd.Timestamp, datetime, date)):
        return value.isoformat()
    if hasattr(value, "item"):
        return value.item()
    return value


def row_record(row: pd.Series) -> dict[str, Any]:
    return {clean(column): json_value(value) for column, value in row.items()}


def optional_column(row: pd.Series, *names: str) -> Any:
    """Return an optional report value without depending on header casing."""
    wanted = {normalize_name(name) for name in names}
    for column, value in row.items():
        if normalize_name(column) in wanted:
            return value
    return None


def date_parts(value: Any) -> list[pd.Timestamp]:
    if isinstance(value, (date, datetime, pd.Timestamp)):
        return [pd.Timestamp(value)]
    parts = [part.strip() for part in clean(value).splitlines() if part.strip()]
    parsed: list[pd.Timestamp] = []
    for part in parts:
        stamp = pd.to_datetime(part, errors="coerce", dayfirst=True)
        if not pd.isna(stamp):
            parsed.append(pd.Timestamp(stamp))
    return parsed


def booking_dates(from_value: Any, to_value: Any) -> tuple[str, str, str, str]:
    from_parts = date_parts(from_value)
    to_parts = date_parts(to_value)
    starts = from_parts or to_parts
    ends = to_parts or from_parts
    if not starts or not ends:
        return "", "", "", ""
    start = min(starts)
    end = max(ends)
    return (
        start.date().isoformat(),
        end.date().isoformat(),
        start.strftime("%H:%M") if start.time() != datetime.min.time() else "",
        end.strftime("%H:%M") if end.time() != datetime.min.time() else "",
    )


def first_iso_date(value: Any) -> str:
    parts = date_parts(value)
    return parts[0].date().isoformat() if parts else ""


def room_arrangement(value: Any) -> str:
    rooms = {normalize_name(part) for part in clean(value).splitlines() if normalize_name(part)}
    return "separate" if len(rooms) > 1 else "shared"


def split_pet_names(value: Any) -> set[str]:
    return {normalize_name(part) for part in clean(value).split(",") if normalize_name(part)}


def read_lookup(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8", newline="") as handle:
        return [dict(row) for row in csv.DictReader(handle)]


def build_customer_matcher(
    customer_rows: list[dict[str, str]],
    cat_rows: list[dict[str, str]],
) -> tuple[dict[str, list[str]], dict[str, set[str]]]:
    name_to_ids: dict[str, list[str]] = defaultdict(list)
    owner_pets: dict[str, set[str]] = defaultdict(set)
    for row in customer_rows:
        name_to_ids[normalize_name(row.get("customer_name"))].append(clean(row.get("external_id")))
    for row in cat_rows:
        owner_id = clean(row.get("owner_external_id"))
        if owner_id:
            owner_pets[owner_id].add(normalize_name(row.get("cat_name")))
    return dict(name_to_ids), dict(owner_pets)


def choose_customer(
    customer_name: Any,
    pet_names: Any,
    name_to_ids: dict[str, list[str]],
    owner_pets: dict[str, set[str]],
) -> tuple[str, str, float, list[str]]:
    candidates = name_to_ids.get(normalize_name(customer_name), [])
    if len(candidates) == 1:
        return candidates[0], "exact_unique_name", 0.95, candidates
    if not candidates:
        return "", "missing_current_customer", 0.0, []

    booked_pets = split_pet_names(pet_names)
    scores = {candidate: len(owner_pets.get(candidate, set()) & booked_pets) for candidate in candidates}
    best_score = max(scores.values(), default=0)
    winners = [candidate for candidate, score in scores.items() if score == best_score and score > 0]
    if len(winners) == 1:
        return winners[0], "name_plus_pet", 0.9, candidates
    return "", "ambiguous_current_customer", 0.0, candidates


def booking_status(value: Any) -> str:
    return {
        "complete": "completed",
        "cancelled": "cancelled",
        "outstanding": "confirmed",
        "booked": "confirmed",
        "in": "checked_in",
    }.get(normalize_name(value), "confirmed")


def payment_status(received: float, outstanding: float) -> str:
    if outstanding > 0:
        return "partial" if received > 0 else "unpaid"
    return "paid" if received > 0 else "unpaid"


def prepare_booking_report(
    source_path: Path,
    output_dir: Path,
    customer_rows: list[dict[str, str]],
    cat_rows: list[dict[str, str]],
) -> dict[str, Any]:
    frame = pd.read_excel(source_path, sheet_name=0, dtype=object)
    required = {
        "Ref", "Customer", "Pet", "Type", "From Date", "To Date", "Run", "Status",
        "Monies Received", "Outstanding", "Created Date", "Source",
        "Cancellation Reason", "Cancellation Note",
    }
    missing = required - {clean(column) for column in frame.columns}
    if missing:
        raise ValueError(f"Booking report is missing required columns: {sorted(missing)}")

    total_rows = frame[frame["Ref"].isna()]
    data = frame[frame["Ref"].notna()].copy()
    name_to_ids, owner_pets = build_customer_matcher(customer_rows, cat_rows)
    mapping_counts: Counter[str] = Counter()
    status_counts: Counter[str] = Counter()
    candidates: list[dict[str, Any]] = []
    raw_records_path = output_dir / "bookings.raw-records.jsonl"

    with raw_records_path.open("w", encoding="utf-8") as raw_handle:
        for row_number, (_, row) in enumerate(data.iterrows(), start=2):
            raw = row_record(row)
            payload = canonical_json(raw)
            record_checksum = sha256_bytes(payload.encode("utf-8"))
            raw_handle.write(canonical_json({
                "row_number": row_number,
                "external_id": clean(row["Ref"]),
                "record_checksum": record_checksum,
                "raw_record": raw,
            }) + "\n")

            owner_id, match_method, confidence, possible_ids = choose_customer(
                row["Customer"], row["Pet"], name_to_ids, owner_pets
            )
            mapping_counts[match_method] += 1
            status_counts[clean(row["Status"]) or "(blank)"] += 1
            check_in, check_out, check_in_time, check_out_time = booking_dates(
                row["From Date"], row["To Date"]
            )
            received = decimal(row["Monies Received"])
            outstanding = decimal(row["Outstanding"])
            legacy_amount_value = optional_column(row, "Amount", "Booking Amount")
            legacy_tax_value = optional_column(row, "Tax", "Tax Amount")
            candidates.append({
                "external_source": "revelation_pets",
                "external_id": clean(row["Ref"]),
                "legacy_reference": clean(row["Ref"]),
                "customer_external_id": owner_id,
                "customer_match_method": match_method,
                "customer_match_confidence": confidence,
                "possible_customer_external_ids": canonical_json(possible_ids),
                "legacy_customer_name": clean(row["Customer"]),
                "legacy_pet_names": clean(row["Pet"]),
                "number_of_cats": max(len(split_pet_names(row["Pet"])), 1),
                "legacy_booking_type": clean(row["Type"]),
                "check_in": check_in,
                "check_out": check_out,
                "check_in_time": check_in_time,
                "check_out_time": check_out_time,
                "legacy_run_name": clean(row["Run"]),
                "room_arrangement": room_arrangement(row["Run"]),
                "status": booking_status(row["Status"]),
                "payment_status": payment_status(received, outstanding),
                "legacy_amount": (
                    f"{decimal(legacy_amount_value):.2f}"
                    if clean(legacy_amount_value) else ""
                ),
                "legacy_tax_amount": (
                    f"{decimal(legacy_tax_value):.2f}"
                    if clean(legacy_tax_value) else ""
                ),
                "legacy_monies_received": f"{received:.2f}",
                "legacy_outstanding": f"{outstanding:.2f}",
                "created_at": first_iso_date(row["Created Date"]),
                "legacy_source": clean(row["Source"]),
                "cancellation_reason": clean(row["Cancellation Reason"]),
                "cancellation_note": clean(row["Cancellation Note"]),
                "legacy_belongs": clean(optional_column(row, "belongs")),
                "legacy_pet_breed": clean(optional_column(row, "pet_breed", "Pet Breed")),
                "legacy_xero": clean(optional_column(row, "xero", "Xero")),
                "source_record_checksum": record_checksum,
            })

    candidates_path = output_dir / "booking-candidates.csv"
    with candidates_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(candidates[0].keys()))
        writer.writeheader()
        writer.writerows(candidates)

    received_sum = round(sum(decimal(value) for value in data["Monies Received"]), 2)
    outstanding_sum = round(sum(decimal(value) for value in data["Outstanding"]), 2)
    active = data[data["Status"].map(normalize_name) != "cancelled"]
    active_received_sum = round(sum(decimal(value) for value in active["Monies Received"]), 2)
    active_outstanding_sum = round(sum(decimal(value) for value in active["Outstanding"]), 2)
    headline_received = decimal(total_rows.iloc[0]["Monies Received"]) if len(total_rows) else 0.0
    headline_outstanding = decimal(total_rows.iloc[0]["Outstanding"]) if len(total_rows) else 0.0
    invalid_dates = sum(not row["check_in"] or not row["check_out"] for row in candidates)

    return {
        "report_type": "bookings",
        "source_file_name": source_path.name,
        "source_sha256": sha256_file(source_path),
        "byte_size": source_path.stat().st_size,
        "row_count": len(data),
        "headline_totals": {
            "monies_received": headline_received,
            "outstanding": headline_outstanding,
            "sales_amount": round(headline_received + headline_outstanding, 2),
        },
        "raw_row_sums": {
            "monies_received": received_sum,
            "outstanding": outstanding_sum,
        },
        "non_cancelled_row_sums": {
            "monies_received": active_received_sum,
            "outstanding": active_outstanding_sum,
        },
        "headline_minus_non_cancelled": {
            "monies_received": round(headline_received - active_received_sum, 2),
            "outstanding": round(headline_outstanding - active_outstanding_sum, 2),
        },
        "status_counts": dict(sorted(status_counts.items())),
        "customer_mapping": dict(sorted(mapping_counts.items())),
        "invalid_booking_dates": invalid_dates,
        "outputs": {
            raw_records_path.name: {
                "sha256": sha256_file(raw_records_path),
                "bytes": raw_records_path.stat().st_size,
            },
            candidates_path.name: {
                "sha256": sha256_file(candidates_path),
                "bytes": candidates_path.stat().st_size,
            },
        },
    }


def payment_data_frame(source_path: Path) -> tuple[pd.DataFrame, dict[str, float]]:
    frame = pd.read_excel(source_path, sheet_name=0, dtype=object)
    required = {
        "Invoice Id", "Customer", "Pet(s) Name", "Payment Description",
        "Payment Date", "Payment Type", "Payment Amount", "Tax Amount",
    }
    missing = required - {clean(column) for column in frame.columns}
    if missing:
        raise ValueError(f"Payment report is missing required columns: {sorted(missing)}")
    parsed_dates = pd.to_datetime(frame["Payment Date"], errors="coerce", dayfirst=True)
    data = frame[parsed_dates.notna()].copy()
    summary: dict[str, float] = {}
    for _, row in frame[parsed_dates.isna()].iterrows():
        label = normalize_name(row["Invoice Id"])
        if label and label not in {"payment type"}:
            summary[label] = decimal(row["Customer"])
    return data, summary


def prepare_payment_report(
    source_path: Path,
    output_dir: Path,
    customer_rows: list[dict[str, str]],
    cat_rows: list[dict[str, str]],
    nondeleted_source_path: Path | None = None,
) -> dict[str, Any]:
    data, summary = payment_data_frame(source_path)
    name_to_ids, owner_pets = build_customer_matcher(customer_rows, cat_rows)
    mapping_counts: Counter[str] = Counter()
    deleted_counts: Counter[str] | None = None
    if nondeleted_source_path:
        nondeleted_data, _ = payment_data_frame(nondeleted_source_path)
        deleted_counts = Counter(
            canonical_json(row_record(row)) for _, row in nondeleted_data.iterrows()
        )

    occurrence_counts: Counter[str] = Counter()
    candidates: list[dict[str, Any]] = []
    raw_records_path = output_dir / "payments.raw-records.jsonl"
    deleted_rows = 0
    with raw_records_path.open("w", encoding="utf-8") as raw_handle:
        for row_number, (_, row) in enumerate(data.iterrows(), start=2):
            raw = row_record(row)
            payload = canonical_json(raw)
            record_checksum = sha256_bytes(payload.encode("utf-8"))
            occurrence_counts[record_checksum] += 1
            occurrence = occurrence_counts[record_checksum]
            is_deleted = False
            if deleted_counts is not None:
                if deleted_counts[payload] > 0:
                    deleted_counts[payload] -= 1
                else:
                    is_deleted = True
                    deleted_rows += 1
            invoice_id = clean(row["Invoice Id"])
            external_id = f"{invoice_id}:{record_checksum[:16]}:{occurrence}"
            raw_handle.write(canonical_json({
                "row_number": row_number,
                "external_id": external_id,
                "record_checksum": record_checksum,
                "legacy_deleted": is_deleted,
                "raw_record": raw,
            }) + "\n")

            owner_id, match_method, confidence, possible_ids = choose_customer(
                row["Customer"], row["Pet(s) Name"], name_to_ids, owner_pets
            )
            mapping_counts[match_method] += 1
            paid_on = pd.to_datetime(row["Payment Date"], errors="coerce", dayfirst=True)
            candidates.append({
                "external_source": "revelation_pets",
                "external_id": external_id,
                "booking_external_id": invoice_id,
                "legacy_invoice_id": invoice_id,
                "customer_external_id": owner_id,
                "customer_match_method": match_method,
                "customer_match_confidence": confidence,
                "possible_customer_external_ids": canonical_json(possible_ids),
                "legacy_customer_name": clean(row["Customer"]),
                "legacy_pet_names": clean(row["Pet(s) Name"]),
                "legacy_description": clean(row["Payment Description"]),
                "paid_on": "" if pd.isna(paid_on) else pd.Timestamp(paid_on).date().isoformat(),
                "legacy_payment_type": clean(row["Payment Type"]),
                "amount": f"{decimal(row['Payment Amount']):.2f}",
                "legacy_tax_amount": f"{decimal(row['Tax Amount']):.2f}",
                "legacy_deleted": str(is_deleted).lower(),
                "source_record_checksum": record_checksum,
            })

    candidates_path = output_dir / "payment-candidates.csv"
    with candidates_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(candidates[0].keys()))
        writer.writeheader()
        writer.writerows(candidates)

    gross = round(sum(decimal(value) for value in data["Payment Amount"]), 2)
    tax = round(sum(decimal(value) for value in data["Tax Amount"]), 2)
    return {
        "report_type": "payments",
        "source_file_name": source_path.name,
        "source_sha256": sha256_file(source_path),
        "byte_size": source_path.stat().st_size,
        "row_count": len(data),
        "headline_totals": summary,
        "raw_row_sums": {"payment_amount": gross, "tax_amount": tax},
        "headline_minus_rows": round(summary.get("total", 0) - gross, 2),
        "customer_mapping": dict(sorted(mapping_counts.items())),
        "deleted_payment_identification": {
            "comparison_file": nondeleted_source_path.name if nondeleted_source_path else None,
            "comparison_sha256": sha256_file(nondeleted_source_path) if nondeleted_source_path else None,
            "identified_deleted_rows": deleted_rows if nondeleted_source_path else None,
        },
        "outputs": {
            raw_records_path.name: {
                "sha256": sha256_file(raw_records_path),
                "bytes": raw_records_path.stat().st_size,
            },
            candidates_path.name: {
                "sha256": sha256_file(candidates_path),
                "bytes": candidates_path.stat().st_size,
            },
        },
    }


def prepare_generic_spreadsheet_report(
    report_type: str,
    source_path: Path,
    output_dir: Path,
) -> dict[str, Any]:
    frame = pd.read_excel(source_path, sheet_name=0, dtype=object)
    safe_name = re.sub(r"[^a-z0-9]+", "-", report_type.casefold()).strip("-")
    raw_records_path = output_dir / f"{safe_name}.raw-records.jsonl"
    with raw_records_path.open("w", encoding="utf-8") as raw_handle:
        for row_number, (_, row) in enumerate(frame.iterrows(), start=2):
            raw = row_record(row)
            payload = canonical_json(raw)
            raw_handle.write(canonical_json({
                "row_number": row_number,
                "external_id": None,
                "record_checksum": sha256_bytes(payload.encode("utf-8")),
                "raw_record": raw,
            }) + "\n")
    return {
        "report_type": report_type,
        "source_file_name": source_path.name,
        "source_sha256": sha256_file(source_path),
        "byte_size": source_path.stat().st_size,
        "row_count": len(frame),
        "columns": [clean(column) for column in frame.columns],
        "outputs": {
            raw_records_path.name: {
                "sha256": sha256_file(raw_records_path),
                "bytes": raw_records_path.stat().st_size,
            }
        },
    }


def parse_named_path(value: str) -> tuple[str, Path]:
    if "=" not in value:
        raise argparse.ArgumentTypeError("Use REPORT_TYPE=/absolute/path/to/report.xlsx")
    name, raw_path = value.split("=", 1)
    if not name.strip() or not raw_path.strip():
        raise argparse.ArgumentTypeError("Both report type and report path are required")
    return name.strip(), Path(raw_path).expanduser().resolve()


def write_manifest(path: Path, manifest: dict[str, Any]) -> None:
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--bookings", type=Path, required=True)
    parser.add_argument("--customers", type=Path, required=True)
    parser.add_argument("--cats", type=Path, required=True)
    parser.add_argument("--payments", type=Path)
    parser.add_argument("--payments-without-deleted", type=Path)
    parser.add_argument(
        "--report",
        action="append",
        type=parse_named_path,
        default=[],
        help="Additional report in REPORT_TYPE=/absolute/path/to/report.xlsx format",
    )
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()

    output_dir = args.output_dir.expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    report = prepare_booking_report(
        args.bookings.expanduser().resolve(),
        output_dir,
        read_lookup(args.customers.expanduser().resolve()),
        read_lookup(args.cats.expanduser().resolve()),
    )
    reports = [report]
    if args.payments:
        reports.append(prepare_payment_report(
            args.payments.expanduser().resolve(),
            output_dir,
            read_lookup(args.customers.expanduser().resolve()),
            read_lookup(args.cats.expanduser().resolve()),
            args.payments_without_deleted.expanduser().resolve()
            if args.payments_without_deleted else None,
        ))
    for report_type, report_path in args.report:
        reports.append(prepare_generic_spreadsheet_report(report_type, report_path, output_dir))
    manifest = {
        "format_version": 1,
        "source_system": "revelation_pets",
        "import_kind": "full_history",
        "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "reports": reports,
    }
    manifest_path = output_dir / "history-manifest.json"
    write_manifest(manifest_path, manifest)
    print(json.dumps({
        "bookings": report["row_count"],
        "headline_totals": report["headline_totals"],
        "customer_mapping": report["customer_mapping"],
        "invalid_booking_dates": report["invalid_booking_dates"],
        "payments": reports[1]["row_count"] if len(reports) > 1 else None,
        "manifest": str(manifest_path),
    }, indent=2))


if __name__ == "__main__":
    main()
