export const CAT_UPDATE_BUCKET = 'cat-update-photos';
export const CAT_UPDATE_MAX_BYTES = 8 * 1024 * 1024;
export const CAT_UPDATE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

type CandidateBooking = {
  id: string;
  check_in: string;
  check_out: string;
  status: string;
  customer: { id: string; name: string; email: string; phone?: string | null } | null;
  room: { id: string; name: string } | null;
  booking_cats: Array<{ cat: { id: string; name: string; breed?: string | null } }>;
  booking_cat_rooms: Array<{ cat: { id: string; name: string }; room: { id: string; name: string } }>;
};

export type CatUpdateCandidate = {
  key: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  catId: string;
  catName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  bookingStatus: string;
  stayStatus: 'boarding' | 'upcoming' | 'completed';
};

export function catUpdateCandidateMatchesSearch(candidate: CatUpdateCandidate, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;
  return [candidate.catName, candidate.customerName, candidate.customerEmail]
    .some((value) => value.toLowerCase().includes(query));
}

export function normalizeCatUpdateCaption(value: string) {
  return value.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim();
}

export function safeCatUpdateFilename(name: string) {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/-+\./g, '.').replace(/^-+|-+$/g, '');
  return cleaned || 'cat-photo.jpg';
}

export function catUpdateFileError(file: Pick<File, 'name' | 'size' | 'type'> | null) {
  if (!file) return 'Choose a photo before sending the update.';
  if (!(CAT_UPDATE_IMAGE_TYPES as readonly string[]).includes(file.type)) return 'Use a JPG, PNG or WebP photo.';
  if (file.size > CAT_UPDATE_MAX_BYTES) return 'Choose a photo smaller than 8 MB.';
  if (file.size <= 0) return 'That photo is empty. Choose a different file.';
  return '';
}

export function buildCatUpdateCandidates(bookings: CandidateBooking[], today = new Date().toISOString().slice(0, 10)) {
  const candidates = bookings
    .filter((booking) => booking.status !== 'cancelled' && booking.customer)
    .flatMap((booking) => booking.booking_cats.map(({ cat }) => {
      const assignedRoom = booking.booking_cat_rooms.find((assignment) => assignment.cat.id === cat.id)?.room;
      const stayStatus: CatUpdateCandidate['stayStatus'] = booking.check_in <= today && booking.check_out >= today
        ? 'boarding'
        : booking.check_in > today ? 'upcoming' : 'completed';
      return {
        key: `${booking.id}:${cat.id}`,
        bookingId: booking.id,
        customerId: booking.customer!.id,
        customerName: booking.customer!.name,
        customerEmail: booking.customer!.email,
        catId: cat.id,
        catName: cat.name,
        roomName: assignedRoom?.name || booking.room?.name || 'Room not assigned',
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        bookingStatus: booking.status,
        stayStatus,
      } satisfies CatUpdateCandidate;
    }))
    .sort((left, right) => {
      const order = { boarding: 0, upcoming: 1, completed: 2 };
      return order[left.stayStatus] - order[right.stayStatus]
        || (left.stayStatus === 'completed' ? right.checkOut.localeCompare(left.checkOut) : left.checkIn.localeCompare(right.checkIn))
        || left.catName.localeCompare(right.catName);
    });
  return candidates;
}
