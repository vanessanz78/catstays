#!/usr/bin/env python3
"""Create a resumable, checksummed Revelation Pets read-only API archive.

The API key is read from a local file and is never written to the archive,
manifest, request logs, or console output.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, Callable


MAX_API_ROWS = 1000


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def parse_date(value: str) -> date:
    return datetime.strptime(value, "%d/%m/%Y").date()


def api_date(value: date) -> str:
    return value.strftime("%d/%m/%Y")


def extract_records(payload: Any, endpoint: str) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if not isinstance(payload, dict):
        return []
    preferred = [endpoint, endpoint.rstrip("s"), "data", "results", "records"]
    for key in preferred:
        value = payload.get(key)
        if isinstance(value, list):
            return [item for item in value if isinstance(item, dict)]
    lists = [value for value in payload.values() if isinstance(value, list)]
    if len(lists) == 1:
        return [item for item in lists[0] if isinstance(item, dict)]
    return []


def record_id(record: dict[str, Any]) -> str:
    for key in ("id", "booking_id", "bookingId", "ref", "reference", "customer_id", "payment_id"):
        value = record.get(key)
        if value is not None and str(value).strip():
            return str(value).strip()
    return hashlib.sha256(canonical_json(record).encode("utf-8")).hexdigest()


@dataclass(frozen=True)
class Page:
    endpoint: str
    start: date
    end: date
    payload: Any
    records: list[dict[str, Any]]


def collect_complete_range(
    endpoint: str,
    start: date,
    end: date,
    fetch_page: Callable[[str, date, date], Any],
) -> list[Page]:
    payload = fetch_page(endpoint, start, end)
    records = extract_records(payload, endpoint)
    if len(records) < MAX_API_ROWS:
        return [Page(endpoint, start, end, payload, records)]
    if start >= end:
        raise RuntimeError(
            f"The {endpoint} API returned {MAX_API_ROWS} rows for {api_date(start)}; "
            "the source may be truncated for that day."
        )
    midpoint = start + timedelta(days=(end - start).days // 2)
    return [
        *collect_complete_range(endpoint, start, midpoint, fetch_page),
        *collect_complete_range(endpoint, midpoint + timedelta(days=1), end, fetch_page),
    ]


class RevelationClient:
    def __init__(self, base_url: str, api_key: str, delay_seconds: float) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.delay_seconds = max(0, delay_seconds)

    def get(self, endpoint: str, params: dict[str, str]) -> Any:
        path = f"{self.base_url}/api/{urllib.parse.quote(self.api_key, safe='')}/{endpoint}"
        url = f"{path}?{urllib.parse.urlencode(params)}"
        request = urllib.request.Request(
            url,
            headers={"Accept": "application/json", "User-Agent": "CatStays migration archive"},
        )
        last_error: Exception | None = None
        for attempt in range(1, 5):
            try:
                with urllib.request.urlopen(request, timeout=60) as response:
                    payload = json.loads(response.read().decode("utf-8"))
                if self.delay_seconds:
                    time.sleep(self.delay_seconds)
                return payload
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
                last_error = error
                if attempt == 4:
                    break
                time.sleep(min(2 ** attempt, 10))
        safe_message = str(last_error).replace(self.api_key, "[REDACTED]")
        raise RuntimeError(f"Revelation API request failed after retries: {safe_message}")

    def dated_page(self, endpoint: str, start: date, end: date) -> Any:
        return self.get(endpoint, {"from_date": api_date(start), "to_date": api_date(end)})


def write_pages(root: Path, pages: list[Page]) -> tuple[Path, list[dict[str, Any]]]:
    pages_dir = root / "pages"
    pages_dir.mkdir(parents=True, exist_ok=True)
    unique: dict[str, dict[str, Any]] = {}
    for page in pages:
        name = f"{page.endpoint}-{page.start.isoformat()}-{page.end.isoformat()}.json"
        path = pages_dir / name
        path.write_text(json.dumps(page.payload, ensure_ascii=False, indent=2), encoding="utf-8")
        for record in page.records:
            key = f"{record_id(record)}:{hashlib.sha256(canonical_json(record).encode('utf-8')).hexdigest()}"
            unique[key] = record
    records = list(unique.values())
    output = root / f"{pages[0].endpoint}.jsonl"
    output.write_text("".join(canonical_json(record) + "\n" for record in records), encoding="utf-8")
    return output, records


def safe_filename(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", value)[:180] or "unknown"


def archive_booking_details(
    client: RevelationClient,
    booking_records: list[dict[str, Any]],
    root: Path,
) -> tuple[Path, int]:
    details_dir = root / "booking-details"
    details_dir.mkdir(parents=True, exist_ok=True)
    detail_payloads: list[Any] = []
    for index, record in enumerate(booking_records, start=1):
        booking_id = record_id(record)
        detail_path = details_dir / f"{safe_filename(booking_id)}.json"
        if detail_path.exists():
            try:
                payload = json.loads(detail_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                payload = client.get("booking", {"id": booking_id})
                detail_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        else:
            payload = client.get("booking", {"id": booking_id})
            detail_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        detail_payloads.append(payload)
        if index % 250 == 0:
            print(f"Archived {index} of {len(booking_records)} booking details.")
    output = root / "booking-details.jsonl"
    output.write_text("".join(canonical_json(item) + "\n" for item in detail_payloads), encoding="utf-8")
    return output, len(detail_payloads)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--api-key-file", type=Path, required=True)
    parser.add_argument("--base-url", default="https://us.revelationpets.com")
    parser.add_argument("--from-date", required=True, help="DD/MM/YYYY")
    parser.add_argument("--to-date", required=True, help="DD/MM/YYYY")
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--delay-seconds", type=float, default=0.15)
    parser.add_argument("--skip-booking-details", action="store_true")
    args = parser.parse_args()

    api_key = args.api_key_file.expanduser().read_text(encoding="utf-8").strip()
    if not api_key:
        raise SystemExit("The API key file is empty.")
    start = parse_date(args.from_date)
    end = parse_date(args.to_date)
    if end < start:
        raise SystemExit("The end date must not be before the start date.")
    root = args.output_dir.expanduser().resolve()
    root.mkdir(parents=True, exist_ok=True)
    client = RevelationClient(args.base_url, api_key, args.delay_seconds)

    manifest: dict[str, Any] = {
        "format_version": 1,
        "source_system": "revelation_pets_api",
        "base_url": args.base_url,
        "from_date": api_date(start),
        "to_date": api_date(end),
        "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "reports": {},
    }
    booking_records: list[dict[str, Any]] = []
    for endpoint in ("customers", "bookings", "payments"):
        pages = collect_complete_range(endpoint, start, end, client.dated_page)
        output, records = write_pages(root, pages)
        manifest["reports"][endpoint] = {
            "pages": len(pages),
            "records": len(records),
            "output": output.name,
            "sha256": sha256(output),
        }
        if endpoint == "bookings":
            booking_records = records
        print(f"Archived {len(records)} {endpoint} records across {len(pages)} complete page(s).")

    if not args.skip_booking_details:
        output, count = archive_booking_details(client, booking_records, root)
        manifest["reports"]["booking_details"] = {
            "records": count,
            "output": output.name,
            "sha256": sha256(output),
        }

    manifest_path = root / "api-manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Archive manifest written to {manifest_path}")


if __name__ == "__main__":
    main()
