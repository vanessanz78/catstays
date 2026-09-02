#!/usr/bin/env python3
"""Convert a Revelation Pets customer workbook into CatStays Smart Import CSVs.

The source workbook stores one customer on the first row of a group and any
additional pets on following rows with blank customer cells. This converter
retains the Revelation customer ID on every output record and keeps legacy-only
fields in JSON metadata so no source information is discarded.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import re
from collections import Counter
from datetime import date, datetime
from pathlib import Path
from typing import Any

import pandas as pd


CUSTOMER_COLUMNS = [
    "customer_name",
    "email",
    "phone",
    "address",
    "notes",
    "created_at",
    "external_source",
    "external_id",
    "legacy_last_booking",
    "legacy_account_balance",
    "legacy_total_spent",
    "legacy_metadata",
]

CAT_COLUMNS = [
    "cat_name",
    "owner_external_id",
    "owner_email",
    "breed",
    "age",
    "medical_notes",
    "dietary_requirements",
    "external_source",
    "external_id",
    "legacy_metadata",
]


def clean(value: Any) -> str:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def number(value: Any) -> float:
    text = clean(value).replace("$", "").replace(",", "")
    if not text:
        return 0.0
    try:
        return round(float(text), 2)
    except ValueError:
        return 0.0


def iso_date(value: Any) -> str:
    text = clean(value)
    if not text:
        return ""
    if isinstance(value, (date, datetime, pd.Timestamp)):
        return value.date().isoformat() if isinstance(value, (datetime, pd.Timestamp)) else value.isoformat()
    parsed = pd.to_datetime(value, errors="coerce", dayfirst=not bool(re.match(r"^\d{4}-\d{2}-\d{2}", text)))
    if pd.isna(parsed):
        return ""
    return parsed.date().isoformat()


def source_bool(value: Any) -> bool | None:
    text = clean(value).lower()
    if not text:
        return None
    if text in {"yes", "y", "true", "1", "signed", "active"}:
        return True
    if text in {"no", "n", "false", "0", "unsigned", "inactive"}:
        return False
    return None


def json_cell(value: dict[str, Any]) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), default=str)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def write_csv(path: Path, columns: list[str], rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def convert(source_path: Path, output_dir: Path) -> dict[str, Any]:
    frame = pd.read_excel(source_path, sheet_name=0, dtype=object)
    output_dir.mkdir(parents=True, exist_ok=True)

    customers: list[dict[str, Any]] = []
    cats: list[dict[str, Any]] = []
    current_customer: dict[str, Any] | None = None
    current_id = ""
    current_email = ""
    pet_number = 0

    for _, raw_row in frame.iterrows():
        row = {clean(key): value for key, value in raw_row.items()}
        row_customer_id = clean(row.get("Custid"))

        if row_customer_id:
            current_id = row_customer_id
            pet_number = 0
            original_name = clean(row.get("Name"))
            original_email = clean(row.get("Email")).lower()
            name = original_name or f"Customer {current_id}"
            current_email = original_email or f"no-email+revelation-{current_id}@catstays.invalid"
            address_parts = [
                clean(row.get("Address Line 1")),
                clean(row.get("Address Line 2")),
                clean(row.get("City")),
                clean(row.get("County")),
                clean(row.get("Postcode")),
            ]
            address = ", ".join(part for part in address_parts if part)
            mobile = clean(row.get("Mobile Phone"))
            telephone = clean(row.get("Telephone"))
            customer_metadata = {
                "original_name": original_name,
                "original_email": original_email,
                "missing_name": not bool(original_name),
                "missing_email": not bool(original_email),
                "telephone": telephone,
                "mobile_phone": mobile,
                "address_line_1": address_parts[0],
                "address_line_2": address_parts[1],
                "city": address_parts[2],
                "county": address_parts[3],
                "postcode": address_parts[4],
                "emergency_contact": clean(row.get("Emergency Contact")),
                "emergency_phone": clean(row.get("Emergency Phone")),
                "marketing_opt_in": source_bool(row.get("Marketing Opt-in")),
                "marketing_opt_in_original": clean(row.get("Marketing Opt-in")),
                "signed_terms": source_bool(row.get("Signed T&Cs")),
                "signed_terms_original": clean(row.get("Signed T&Cs")),
                "daycare_credits": clean(row.get("Daycare Credits")),
            }
            current_customer = {
                "customer_name": name,
                "email": current_email,
                "phone": mobile or telephone,
                "address": address,
                "notes": clean(row.get("Notes")),
                "created_at": iso_date(row.get("Customer Added")),
                "external_source": "revelation_pets",
                "external_id": current_id,
                "legacy_last_booking": iso_date(row.get("Last Booking")),
                "legacy_account_balance": number(row.get("Account Balance")),
                "legacy_total_spent": number(row.get("Total Amount spent")),
                "legacy_metadata": json_cell(customer_metadata),
            }
            customers.append(current_customer)

        pet_name = clean(row.get("Pet_Name"))
        if not pet_name:
            continue
        if not current_customer or not current_id:
            raise ValueError("A pet row appeared before its customer row.")

        pet_number += 1
        medication = clean(row.get("Medication"))
        pet_notes = clean(row.get("Notes.1"))
        medical_parts = []
        if medication:
            medical_parts.append(f"Medication: {medication}")
        if pet_notes:
            medical_parts.append(f"Legacy notes: {pet_notes}")
        pet_metadata = {
            "pet_type": clean(row.get("Type")),
            "inactive_or_deceased": source_bool(row.get("Pet Deceased or Inactive")),
            "inactive_or_deceased_original": clean(row.get("Pet Deceased or Inactive")),
            "sex": clean(row.get("Sex")),
            "date_of_birth": iso_date(row.get("DOB")),
            "registration": clean(row.get("Registration")),
            "microchip": clean(row.get("Microchip")),
            "spayed_or_neutered": source_bool(row.get("Spayed/Neutered")),
            "spayed_or_neutered_original": clean(row.get("Spayed/Neutered")),
            "weight": clean(row.get("Weight")),
            "vaccinated": source_bool(row.get("Vaccinated")),
            "vaccinated_original": clean(row.get("Vaccinated")),
            "medication": medication,
            "notes": pet_notes,
            "vet_name": clean(row.get("Vet Name")),
        }
        cats.append({
            "cat_name": pet_name,
            "owner_external_id": current_id,
            "owner_email": current_email,
            "breed": clean(row.get("Breed")),
            "age": clean(row.get("Age")),
            "medical_notes": "\n".join(medical_parts),
            "dietary_requirements": clean(row.get("Dietary")),
            "external_source": "revelation_pets",
            "external_id": f"{current_id}:{pet_number}",
            "legacy_metadata": json_cell(pet_metadata),
        })

    customer_ids = [row["external_id"] for row in customers]
    cat_ids = [row["external_id"] for row in cats]
    if len(customer_ids) != len(set(customer_ids)):
        raise ValueError("Duplicate Revelation customer IDs were found.")
    if len(cat_ids) != len(set(cat_ids)):
        raise ValueError("Duplicate generated pet IDs were found.")

    customers_path = output_dir / "revelation-customers.csv"
    cats_path = output_dir / "revelation-cats.csv"
    write_csv(customers_path, CUSTOMER_COLUMNS, customers)
    write_csv(cats_path, CAT_COLUMNS, cats)

    real_emails = [row["email"] for row in customers if not row["email"].endswith("@catstays.invalid")]
    duplicate_emails = {email: count for email, count in Counter(real_emails).items() if count > 1}
    manifest = {
        "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "source": str(source_path),
        "source_sha256": sha256(source_path),
        "customers": len(customers),
        "cats": len(cats),
        "customers_with_placeholder_email": sum(row["email"].endswith("@catstays.invalid") for row in customers),
        "customers_with_missing_source_name": sum(row["customer_name"].startswith("Customer ") for row in customers),
        "shared_real_email_addresses": len(duplicate_emails),
        "customer_rows_using_shared_real_email": sum(duplicate_emails.values()),
        "positive_credit_balances": sum(float(row["legacy_account_balance"]) > 0 for row in customers),
        "negative_credit_balances": sum(float(row["legacy_account_balance"]) < 0 for row in customers),
        "account_balance_total": round(sum(float(row["legacy_account_balance"]) for row in customers), 2),
        "outputs": {
            customers_path.name: {"sha256": sha256(customers_path), "bytes": customers_path.stat().st_size},
            cats_path.name: {"sha256": sha256(cats_path), "bytes": cats_path.stat().st_size},
        },
    }
    manifest_path = output_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()
    manifest = convert(args.source.expanduser().resolve(), args.output_dir.expanduser().resolve())
    print(json.dumps({key: value for key, value in manifest.items() if key not in {"source", "outputs"}}, indent=2))


if __name__ == "__main__":
    main()
