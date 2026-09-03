import test from "node:test";
import assert from "node:assert/strict";
import { bookingReviewCatStays, refreshBookingReview, mergeBookingReviewRecords } from "./bookingReview";

test("a shared booking itemizes every cat against the shared room", () => {
  assert.deepEqual(
    bookingReviewCatStays({
      catNames: ["Blaise", "Loop"],
      roomArrangement: "shared",
      roomAssignments: [
        { catName: "Blaise", roomName: "Communal Room 1" },
        { catName: "Loop", roomName: "Communal Room 1" },
      ],
    }),
    [
      { catName: "Blaise", roomName: "Communal Room 1", sharingRoom: true },
      { catName: "Loop", roomName: "Communal Room 1", sharingRoom: true },
    ],
  );
});

test("separate accommodation keeps each cat and room distinct", () => {
  assert.deepEqual(
    bookingReviewCatStays({
      catNames: ["Blaise", "Loop"],
      roomArrangement: "separate",
      roomAssignments: [
        { catName: "Blaise", roomName: "Private Room 1" },
        { catName: "Loop", roomName: "Private Room 2" },
      ],
    }),
    [
      { catName: "Blaise", roomName: "Private Room 1", sharingRoom: false },
      { catName: "Loop", roomName: "Private Room 2", sharingRoom: false },
    ],
  );
});

test("legacy bookings fall back to their primary room without hiding cats", () => {
  assert.deepEqual(
    bookingReviewCatStays({
      catNames: ["Pipi"],
      roomArrangement: "shared",
      roomNumber: "Indoor Room 3",
    }),
    [{ catName: "Pipi", roomName: "Indoor Room 3", sharingRoom: false }],
  );
});

test("older bookings infer sharing from matching room assignments", () => {
  assert.deepEqual(
    bookingReviewCatStays({
      catNames: ["Blaise", "Loop"],
      roomAssignments: [
        { catName: "Blaise", roomName: "Private Room 1" },
        { catName: "Loop", roomName: "Private Room 2" },
      ],
    }),
    [
      { catName: "Blaise", roomName: "Private Room 1", sharingRoom: false },
      { catName: "Loop", roomName: "Private Room 2", sharingRoom: false },
    ],
  );
});

test("an open zero-price review receives the saved confirmed total without reopening", () => {
  const stale = { id: "sam", total: 0, status: "pending" };
  const fresh = { id: "sam", total: 92, status: "confirmed" };
  assert.equal(refreshBookingReview(stale, fresh), fresh);
});
test("focused pricing wins over the older booking list", () => {
  const old = { id: "sam", total: 0 }, fresh = { id: "sam", total: 92 };
  assert.deepEqual(mergeBookingReviewRecords([old, {id:"other", total:50}], [fresh]),
    [{id:"other", total:50}, fresh]);
});
test("refresh cannot reopen a closed review or replace a different selected booking", () => {
  const current = {id:"other", total:25}, fresh = {id:"sam", total:92};
  assert.equal(refreshBookingReview(null, fresh), null);
  assert.equal(refreshBookingReview(current, fresh), current);
  assert.equal(refreshBookingReview(current, undefined), current);
});
test("authoritative zero amounts and later price amendments are preserved, not guessed", () => {
  assert.equal(refreshBookingReview({id:"sam",total:92}, {id:"sam",total:0})?.total, 0);
  assert.equal(refreshBookingReview({id:"sam",total:92}, {id:"sam",total:115})?.total, 115);
});
