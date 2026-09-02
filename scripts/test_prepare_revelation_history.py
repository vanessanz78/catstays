from __future__ import annotations

import csv
import json
import tempfile
import unittest
from pathlib import Path

import pandas as pd

from prepare_revelation_history import (
    prepare_booking_report,
    prepare_generic_spreadsheet_report,
    prepare_payment_report,
)


class PrepareRevelationHistoryTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.root = Path(self.temp_dir.name)

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def test_preserves_rows_and_reconciles_cancelled_totals(self) -> None:
        source = self.root / "bookings.xlsx"
        rows = [
            {
                "Ref": 10, "Customer": "Alex Example", "Pet": "Miso", "Type": "Cat",
                "From Date": "01/09/2026 9:00 AM", "To Date": "03/09/2026 4:30 PM",
                "Run": "Private Room 1", "Status": "Complete", "Monies Received": 120,
                "Outstanding": 0, "Created Date": "20/08/2026", "Source": "Front End",
                "Cancellation Reason": "", "Cancellation Note": "",
            },
            {
                "Ref": 11, "Customer": "Alex Example", "Pet": "Miso", "Type": "Cat",
                "From Date": "04/09/2026", "To Date": "05/09/2026",
                "Run": "Private Room 1", "Status": "Cancelled", "Monies Received": 50,
                "Outstanding": 70, "Created Date": "21/08/2026", "Source": "Online",
                "Cancellation Reason": "Change of Plans", "Cancellation Note": "Retain credit",
            },
            {
                "Ref": None, "Customer": None, "Pet": None, "Type": None,
                "From Date": None, "To Date": None, "Run": None, "Status": None,
                "Monies Received": 120, "Outstanding": 0, "Created Date": None,
                "Source": None, "Cancellation Reason": None, "Cancellation Note": None,
            },
        ]
        pd.DataFrame(rows).to_excel(source, index=False)
        report = prepare_booking_report(
            source,
            self.root,
            [{"customer_name": "Alex Example", "external_id": "customer-1"}],
            [{"owner_external_id": "customer-1", "cat_name": "Miso"}],
        )
        self.assertEqual(report["row_count"], 2)
        self.assertEqual(report["headline_totals"]["sales_amount"], 120)
        self.assertEqual(report["raw_row_sums"]["monies_received"], 170)
        self.assertEqual(report["non_cancelled_row_sums"]["monies_received"], 120)
        self.assertEqual(report["customer_mapping"], {"exact_unique_name": 2})

        raw_lines = (self.root / "bookings.raw-records.jsonl").read_text().splitlines()
        self.assertEqual(len(raw_lines), 2)
        self.assertEqual(json.loads(raw_lines[1])["raw_record"]["Cancellation Note"], "Retain credit")

        with (self.root / "booking-candidates.csv").open(newline="", encoding="utf-8") as handle:
            candidates = list(csv.DictReader(handle))
        self.assertEqual(candidates[0]["check_in_time"], "09:00")
        self.assertEqual(candidates[0]["check_out_time"], "16:30")
        self.assertEqual(candidates[1]["status"], "cancelled")

    def test_flags_ambiguous_and_missing_customers_without_guessing(self) -> None:
        source = self.root / "bookings.xlsx"
        pd.DataFrame([
            {
                "Ref": 20, "Customer": "Sam Same", "Pet": "Kit", "Type": "Cat",
                "From Date": "01/09/2026", "To Date": "02/09/2026", "Run": "Communal 1",
                "Status": "Booked", "Monies Received": 0, "Outstanding": 40,
                "Created Date": "01/09/2026", "Source": "Online",
                "Cancellation Reason": "", "Cancellation Note": "",
            },
            {
                "Ref": None, "Customer": None, "Pet": None, "Type": None,
                "From Date": None, "To Date": None, "Run": None, "Status": None,
                "Monies Received": 0, "Outstanding": 40, "Created Date": None,
                "Source": None, "Cancellation Reason": None, "Cancellation Note": None,
            },
        ]).to_excel(source, index=False)
        report = prepare_booking_report(
            source,
            self.root,
            [
                {"customer_name": "Sam Same", "external_id": "one"},
                {"customer_name": "Sam Same", "external_id": "two"},
            ],
            [
                {"owner_external_id": "one", "cat_name": "Kit"},
                {"owner_external_id": "two", "cat_name": "Kit"},
            ],
        )
        self.assertEqual(report["customer_mapping"], {"ambiguous_current_customer": 1})
        with (self.root / "booking-candidates.csv").open(newline="", encoding="utf-8") as handle:
            candidate = next(csv.DictReader(handle))
        self.assertEqual(candidate["customer_external_id"], "")
        self.assertEqual(json.loads(candidate["possible_customer_external_ids"]), ["one", "two"])

    def test_identifies_deleted_payments_by_comparing_report_variants(self) -> None:
        columns = [
            "Invoice Id", "Customer", "Pet(s) Name", "Payment Description",
            "Payment Date", "Payment Type", "Payment Amount", "Tax Amount",
        ]
        kept = [10, "Alex Example", "Miso", "Deposit", "01/09/2026", "Cash", 50, 6.52]
        deleted = [10, "Alex Example", "Miso", "Correction", "02/09/2026", "Cash", -10, -1.3]
        summary = ["Total", "40.00", None, None, None, None, None, None]
        with_deleted = self.root / "payments-with-deleted.xlsx"
        without_deleted = self.root / "payments-without-deleted.xlsx"
        pd.DataFrame([kept, deleted, summary], columns=columns).to_excel(with_deleted, index=False)
        pd.DataFrame([kept, ["Total", "50.00", None, None, None, None, None, None]], columns=columns).to_excel(without_deleted, index=False)
        report = prepare_payment_report(
            with_deleted,
            self.root,
            [{"customer_name": "Alex Example", "external_id": "customer-1"}],
            [{"owner_external_id": "customer-1", "cat_name": "Miso"}],
            without_deleted,
        )
        self.assertEqual(report["row_count"], 2)
        self.assertEqual(report["raw_row_sums"]["payment_amount"], 40)
        self.assertEqual(report["deleted_payment_identification"]["identified_deleted_rows"], 1)
        with (self.root / "payment-candidates.csv").open(newline="", encoding="utf-8") as handle:
            candidates = list(csv.DictReader(handle))
        self.assertEqual(candidates[0]["legacy_deleted"], "false")
        self.assertEqual(candidates[1]["legacy_deleted"], "true")

    def test_generic_report_keeps_every_row_and_column(self) -> None:
        source = self.root / "deposits.xlsx"
        pd.DataFrame([
            {"Ref": 1, "Status": "Paid", "Deposit amount": 50},
            {"Ref": 2, "Status": "Refunded", "Deposit amount": -50},
        ]).to_excel(source, index=False)
        report = prepare_generic_spreadsheet_report("deposits", source, self.root)
        self.assertEqual(report["row_count"], 2)
        self.assertEqual(report["columns"], ["Ref", "Status", "Deposit amount"])
        records = (self.root / "deposits.raw-records.jsonl").read_text().splitlines()
        self.assertEqual(len(records), 2)
        self.assertEqual(json.loads(records[1])["raw_record"]["Status"], "Refunded")


if __name__ == "__main__":
    unittest.main()
