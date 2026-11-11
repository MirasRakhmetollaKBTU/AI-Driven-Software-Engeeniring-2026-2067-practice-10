import { describe, test, expect } from 'vitest';
import { canBook, validateBooking, type BookingInput } from './booking';
import { BASE_BOOKINGS, SAMPLE_ROOM, DEFAULT_CURRENT_TIME_MIN } from './fixtures';

const BASE_FIXTURE: BookingInput = {
  start: 660,
  end: 720,
  now: 540,
  blocked: false,
  bookings: BASE_BOOKINGS,
};

describe('Practice #07: Room Availability Tests (T01–T17)', () => {
  // T01
  test('T01 (AC4): touching after is available', () => {
    const input: BookingInput = { ...BASE_FIXTURE, start: 660, end: 720 };
    expect(canBook(input)).toBe(true);
  });

  // T02
  test('T02 (AC1): starts now is rejected', () => {
    const input: BookingInput = { ...BASE_FIXTURE, start: 540, end: 570 };
    expect(canBook(input)).toBe(false);
  });

  // T03
  test('T03 (AC1): zero duration is rejected', () => {
    const input: BookingInput = { ...BASE_FIXTURE, start: 720, end: 720 };
    expect(canBook(input)).toBe(false);
  });

  // T04
  test('T04 (AC1): reversed interval is rejected', () => {
    const input: BookingInput = { ...BASE_FIXTURE, start: 750, end: 720 };
    expect(canBook(input)).toBe(false);
  });

  // T05
  test('T05 (AC1): past day end is rejected', () => {
    const input: BookingInput = { ...BASE_FIXTURE, start: 1380, end: 1441 };
    expect(canBook(input)).toBe(false);
  });

  // T06
  test('T06 (AC2): exactly 120 minutes is accepted', () => {
    const input: BookingInput = { ...BASE_FIXTURE, start: 720, end: 840 };
    expect(canBook(input)).toBe(true);
  });

  // T07
  test('T07 (AC2): 121 minutes is rejected', () => {
    const input: BookingInput = { ...BASE_FIXTURE, start: 720, end: 841 };
    expect(canBook(input)).toBe(false);
  });

  // T08
  test('T08 (AC4): touching before is available', () => {
    const input: BookingInput = { ...BASE_FIXTURE, start: 570, end: 600 };
    expect(canBook(input)).toBe(true);
  });

  // T09
  test('T09 (AC4): partial overlap is rejected', () => {
    const input: BookingInput = { ...BASE_FIXTURE, start: 630, end: 690 };
    expect(canBook(input)).toBe(false);
  });

  // T10
  test('T10 (AC4): interval containing existing booking is rejected', () => {
    const input: BookingInput = { ...BASE_FIXTURE, start: 570, end: 690 };
    expect(canBook(input)).toBe(false);
  });

  // T11
  test('T11 (AC4): interval inside existing booking is rejected', () => {
    const input: BookingInput = { ...BASE_FIXTURE, start: 615, end: 645 };
    expect(canBook(input)).toBe(false);
  });

  // T12
  test('T12 (AC4): identical interval is rejected', () => {
    const input: BookingInput = { ...BASE_FIXTURE, start: 600, end: 660 };
    expect(canBook(input)).toBe(false);
  });

  // T13
  test('T13 (AC3): blocked room is rejected regardless of times', () => {
    const input: BookingInput = { ...BASE_FIXTURE, start: 660, end: 720, blocked: true };
    expect(canBook(input)).toBe(false);
  });

  // T14
  test('T14 (AC4): request with empty bookings list is accepted', () => {
    const input: BookingInput = { ...BASE_FIXTURE, start: 630, end: 690, bookings: [] };
    expect(canBook(input)).toBe(true);
  });

  // T15 (AC5 Data Preservation)
  test('T15 (AC5): bookings array remains unmutated after call', () => {
    const freshBookings = [{ start: 600, end: 660 }];
    const input: BookingInput = {
      ...BASE_FIXTURE,
      start: 630,
      end: 690,
      bookings: freshBookings,
    };
    const beforeState = JSON.stringify(freshBookings);

    canBook(input);

    expect(JSON.stringify(input.bookings)).toBe(beforeState);
  });

  // T16 (Justified Custom Case 1)
  test('T16 (AC1): early day start boundary is accepted', () => {
    const input: BookingInput = {
      ...BASE_FIXTURE,
      start: 0,
      end: 60,
      now: -1,
      bookings: [],
    };
    expect(canBook(input)).toBe(true);
  });

  // T17 (Justified Custom Case 2)
  test('T17 (AC4): fits neatly between multiple bookings', () => {
    const input: BookingInput = {
      ...BASE_FIXTURE,
      start: 720,
      end: 780,
      bookings: [
        { start: 600, end: 660 },
        { start: 900, end: 960 },
      ],
    };
    expect(canBook(input)).toBe(true);
  });
});

describe('validateBooking: result object and failure reasons', () => {
  test('available result has ok:true and no reasons', () => {
    const result = validateBooking({ ...BASE_FIXTURE, start: 660, end: 720 });
    expect(result).toEqual({ ok: true });
  });

  test('range violation produces a range reason', () => {
    const result = validateBooking({ ...BASE_FIXTURE, start: 750, end: 720 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons).toEqual(
        expect.arrayContaining([
          'Times must satisfy 0 ≤ start < end ≤ 1440 (minutes after midnight).',
        ])
      );
    }
  });

  test('past start produces a current-time reason referencing the label', () => {
    const result = validateBooking({ ...BASE_FIXTURE, start: 540, end: 570, now: 540 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons).toEqual(
        expect.arrayContaining(['Start time must be after the current time (09:00).'])
      );
    }
  });

  test('too-long duration produces a duration reason', () => {
    const result = validateBooking({ ...BASE_FIXTURE, start: 720, end: 841 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons).toEqual(
        expect.arrayContaining(['Booking duration cannot exceed 120 minutes.'])
      );
    }
  });

  test('blocked room produces a blocked reason', () => {
    const result = validateBooking({ ...BASE_FIXTURE, blocked: true });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons).toEqual(
        expect.arrayContaining([
          'This room is currently blocked and cannot be booked.',
        ])
      );
    }
  });

  test('overlap reason lists the conflicting booking label', () => {
    const result = validateBooking({ ...BASE_FIXTURE, start: 630, end: 690 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons).toEqual(
        expect.arrayContaining(['Overlaps with existing booking(s): 10:00–11:00.'])
      );
    }
  });

  test('multiple violations accumulate multiple reasons', () => {
    const result = validateBooking({
      ...BASE_FIXTURE,
      start: 540,
      end: 1441,
      blocked: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons.length).toBeGreaterThanOrEqual(3);
    }
  });

  test('canBook is a boolean wrapper consistent with validateBooking', () => {
    const input: BookingInput = { ...BASE_FIXTURE, start: 630, end: 690 };
    expect(canBook(input)).toBe(validateBooking(input).ok);
  });
});

describe('shared fixtures', () => {
  test('SAMPLE_ROOM has UI fields id and title on every booking', () => {
    for (const b of SAMPLE_ROOM.bookings) {
      expect(typeof b.id).toBe('number');
      expect(typeof b.title).toBe('string');
      expect(b.title.length).toBeGreaterThan(0);
    }
  });

  test('BASE_BOOKINGS is a non-empty array of intervals', () => {
    expect(BASE_BOOKINGS.length).toBeGreaterThan(0);
    for (const b of BASE_BOOKINGS) {
      expect(b.start).toBeLessThan(b.end);
    }
  });

  test('DEFAULT_CURRENT_TIME_MIN is within the day range', () => {
    expect(DEFAULT_CURRENT_TIME_MIN).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_CURRENT_TIME_MIN).toBeLessThanOrEqual(1440);
  });
});

describe('regression: named scenarios tied to AC1–AC6', () => {
  // Each test explains its expected result via the AC it exercises.

  test('past start time is rejected — AC1 requires start > now', () => {
    const result = validateBooking({ ...BASE_FIXTURE, start: 500, end: 540, now: 540 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons).toEqual(
        expect.arrayContaining(['Start time must be after the current time (09:00).'])
      );
    }
  });

  test('reversed interval (start > end) is rejected — AC1 requires start < end', () => {
    const result = validateBooking({ ...BASE_FIXTURE, start: 800, end: 720 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons).toEqual(
        expect.arrayContaining([
          'Times must satisfy 0 ≤ start < end ≤ 1440 (minutes after midnight).',
        ])
      );
    }
  });

  test('121-minute duration is rejected while 120 is the AC2 ceiling', () => {
    const result = validateBooking({ ...BASE_FIXTURE, start: 720, end: 841 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons).toEqual(
        expect.arrayContaining(['Booking duration cannot exceed 120 minutes.'])
      );
    }
  });

  test('blocked room is rejected even with otherwise-valid times — AC3', () => {
    const result = validateBooking({ ...BASE_FIXTURE, start: 660, end: 720, blocked: true });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons).toEqual(
        expect.arrayContaining([
          'This room is currently blocked and cannot be booked.',
        ])
      );
    }
  });

  test('overlapping request is rejected and names the conflicting interval — AC4', () => {
    const result = validateBooking({ ...BASE_FIXTURE, start: 630, end: 690 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasons).toEqual(
        expect.arrayContaining(['Overlaps with existing booking(s): 10:00–11:00.'])
      );
    }
  });

  test('touching at the earlier endpoint is allowed — AC4 permits endpoint contact', () => {
    const result = validateBooking({ ...BASE_FIXTURE, start: 570, end: 600 });
    expect(result).toEqual({ ok: true });
  });

  test('touching at the later endpoint is allowed — AC4 permits endpoint contact', () => {
    const result = validateBooking({ ...BASE_FIXTURE, start: 660, end: 720 });
    expect(result).toEqual({ ok: true });
  });

  test('shared fixtures are unchanged after running validation scenarios — AC5', () => {
    const roomSnapshot = JSON.stringify(SAMPLE_ROOM);
    const baseSnapshot = JSON.stringify(BASE_BOOKINGS);

    validateBooking({ ...BASE_FIXTURE, start: 630, end: 690, bookings: BASE_BOOKINGS });
    validateBooking({
      ...BASE_FIXTURE,
      start: 540,
      end: 1441,
      blocked: true,
      bookings: SAMPLE_ROOM.bookings,
    });

    expect(JSON.stringify(SAMPLE_ROOM)).toBe(roomSnapshot);
    expect(JSON.stringify(BASE_BOOKINGS)).toBe(baseSnapshot);
  });
});

describe('immutability (AC5)', () => {
  test('validateBooking does not mutate the bookings array or its elements', () => {
    const bookings = [
      { start: 600, end: 660 },
      { start: 900, end: 960 },
    ];
    const input: BookingInput = {
      ...BASE_FIXTURE,
      start: 630,
      end: 690,
      bookings,
    };
    const before = JSON.stringify(bookings);

    validateBooking(input);

    expect(JSON.stringify(input.bookings)).toBe(before);
  });

  test('validateBooking does not mutate when multiple reasons are produced', () => {
    const bookings = [{ start: 600, end: 660 }];
    const input: BookingInput = {
      ...BASE_FIXTURE,
      start: 540,
      end: 1441,
      blocked: true,
      bookings,
    };
    const before = JSON.stringify(bookings);

    validateBooking(input);

    expect(JSON.stringify(input.bookings)).toBe(before);
  });
});
