export type BookingReviewRoomAssignment = {
  catId?: string;
  catName: string;
  roomName: string;
};

export type BookingReviewInput = {
  catNames: string[];
  roomArrangement?: "shared" | "separate" | string;
  roomAssignments?: BookingReviewRoomAssignment[];
  roomNumber?: string;
  roomType?: string;
};

export type BookingReviewCatStay = {
  catName: string;
  roomName: string;
  sharingRoom: boolean;
};

export function bookingReviewCatStays(
  booking: BookingReviewInput,
): BookingReviewCatStay[] {
  const catNames = booking.catNames.map((name) => name.trim()).filter(Boolean);
  const assignments = booking.roomAssignments ?? [];
  const fallbackRoom =
    booking.roomNumber || booking.roomType || "Room not assigned";
  const stays = catNames.map((catName, index) => {
    const assignment =
      assignments.find((item) => item.catName === catName) ??
      assignments[index];
    return {
      catName,
      roomName: assignment?.roomName || fallbackRoom,
    };
  });

  return stays.map((stay) => {
    const sharingRoom =
      booking.roomArrangement === "shared"
        ? stays.length > 1
        : booking.roomArrangement === "separate"
          ? false
          : stays.filter((otherStay) => otherStay.roomName === stay.roomName)
              .length > 1;

    return {
      ...stay,
      sharingRoom,
    };
  });
}

/** Refresh the open review without reopening it or replacing another booking. */
export function refreshBookingReview<T extends { id: string }>(
  current: T | null,
  refreshed: T | undefined,
): T | null {
  if (!current || !refreshed || current.id !== refreshed.id) return current;
  return refreshed;
}

/** A focused booking read takes precedence over an older list snapshot. */
export function mergeBookingReviewRecords<T extends { id: string }>(list: T[], focused: T[]): T[] {
  const focusedIds = new Set(focused.map(record => record.id));
  return [...list.filter(record => !focusedIds.has(record.id)), ...focused];
}
