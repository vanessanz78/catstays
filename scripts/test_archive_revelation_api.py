from __future__ import annotations

import unittest
from datetime import date

from archive_revelation_api import MAX_API_ROWS, collect_complete_range, extract_records


class RevelationApiArchiveTests(unittest.TestCase):
    def test_extracts_common_response_shapes(self) -> None:
        self.assertEqual(extract_records({"bookings": [{"id": 1}]}, "bookings"), [{"id": 1}])
        self.assertEqual(extract_records({"data": [{"id": 2}]}, "payments"), [{"id": 2}])
        self.assertEqual(extract_records([{"id": 3}], "customers"), [{"id": 3}])

    def test_splits_ranges_that_hit_the_api_limit(self) -> None:
        calls: list[tuple[date, date]] = []

        def fake_fetch(endpoint: str, start: date, end: date):
            calls.append((start, end))
            if (end - start).days > 1:
                return {endpoint: [{"id": index} for index in range(MAX_API_ROWS)]}
            return {endpoint: [{"id": f"{start}-{end}"}]}

        pages = collect_complete_range(
            "bookings", date(2026, 1, 1), date(2026, 1, 8), fake_fetch
        )
        self.assertGreater(len(calls), 1)
        self.assertTrue(all(len(page.records) < MAX_API_ROWS for page in pages))
        self.assertEqual(pages[0].start, date(2026, 1, 1))
        self.assertEqual(pages[-1].end, date(2026, 1, 8))

    def test_refuses_a_truncated_single_day(self) -> None:
        def fake_fetch(endpoint: str, start: date, end: date):
            return {endpoint: [{"id": index} for index in range(MAX_API_ROWS)]}

        with self.assertRaisesRegex(RuntimeError, "truncated"):
            collect_complete_range(
                "payments", date(2026, 1, 1), date(2026, 1, 1), fake_fetch
            )


if __name__ == "__main__":
    unittest.main()
