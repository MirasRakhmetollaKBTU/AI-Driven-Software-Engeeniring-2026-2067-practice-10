import { minutesToLabel } from './format';

export type BookingInterval = {
  start: number;
  end: number;
};

export type BookingInput = {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: Array<BookingInterval>;
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; reasons: string[] };

/**
 * Central validation for a booking request (AC1–AC5).
 * Pure: never mutates `bookings`. Returns a result object carrying the
 * availability status and, when unavailable, human-readable failure reasons.
 */
export function validateBooking({
  start,
  end,
  now,
  blocked,
  bookings,
}: BookingInput): ValidationResult {
  const reasons: string[] = [];

  // AC1: valid range and future start
  if (!(0 <= start && start < end && end <= 1440)) {
    reasons.push('Times must satisfy 0 ≤ start < end ≤ 1440 (minutes after midnight).');
  }
  if (start <= now) {
    reasons.push(`Start time must be after the current time (${minutesToLabel(now)}).`);
  }

  // AC2: max 120 minutes
  if (end > start && end - start > 120) {
    reasons.push('Booking duration cannot exceed 120 minutes.');
  }

  // AC3: blocked room
  if (blocked) {
    reasons.push('This room is currently blocked and cannot be booked.');
  }

  // AC4: no overlaps (touching at endpoints is allowed)
  const overlapping = bookings.filter((b) => start < b.end && b.start < end);
  if (overlapping.length > 0) {
    const labels = overlapping
      .map((b) => `${minutesToLabel(b.start)}–${minutesToLabel(b.end)}`)
      .join(', ');
    reasons.push(`Overlaps with existing booking(s): ${labels}.`);
  }

  return reasons.length === 0 ? { ok: true } : { ok: false, reasons };
}

/**
 * Boolean wrapper over validateBooking, retained for backward compatibility.
 */
export function canBook(input: BookingInput): boolean {
  return validateBooking(input).ok;
}
