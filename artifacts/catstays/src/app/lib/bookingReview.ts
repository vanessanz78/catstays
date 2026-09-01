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
