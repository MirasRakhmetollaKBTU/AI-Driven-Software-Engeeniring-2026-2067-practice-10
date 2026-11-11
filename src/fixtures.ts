// Shared booking fixtures used by both the UI and the test suite.
// UI-only fields (id, title) live alongside the validation fields so a single
// source of truth describes the sample room.

export type Booking = {
  id: number;
  title: string;
  start: number;
  end: number;
};

export type Room = {
  name: string;
  building: string;
  capacity: number;
  status: 'available' | 'blocked';
  bookings: Booking[];
};

export const SAMPLE_ROOM: Room = {
  name: 'Engineering Hall — Room 204',
  building: 'Engineering Block B',
  capacity: 40,
  status: 'available',
  bookings: [
    { id: 1, title: 'Data Structures Lecture', start: 540, end: 600 },
    { id: 2, title: 'Faculty Meeting', start: 720, end: 780 },
    { id: 3, title: 'Robotics Lab Prep', start: 900, end: 960 },
    { id: 4, title: 'Guest Seminar: AI Ethics', start: 1080, end: 1140 },
  ],
};

// Minimal booking-only fixture used by validation tests that don't care about
// room metadata. Shares the same Booking type as the room.
export const BASE_BOOKINGS: Booking[] = [{ id: 0, title: '', start: 600, end: 660 }];

export const DEFAULT_CURRENT_TIME_MIN = 615;
