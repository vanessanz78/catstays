import test from "node:test";
import assert from "node:assert/strict";
import { bookingReviewCatStays } from "./bookingReview";

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
