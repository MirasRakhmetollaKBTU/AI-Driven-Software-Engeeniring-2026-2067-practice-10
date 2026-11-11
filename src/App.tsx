import { useMemo, useState } from 'react';
import {
  DoorOpen,
  Clock,
  CalendarClock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CalendarDays,
  Info,
} from 'lucide-react';

import { validateBooking } from './booking';
import { clamp, minutesToLabel } from './format';
import { SAMPLE_ROOM, DEFAULT_CURRENT_TIME_MIN, type Room } from './fixtures';

type Verdict =
  | { kind: 'available' }
  | { kind: 'unavailable'; reasons: string[] };

function parseWholeMinute(raw: string): number | null {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isInteger(value) ? value : null;
}

function evaluateRequest(
  startRaw: number | null,
  endRaw: number | null,
  currentTime: number | null,
  room: Room
): Verdict {
  if (currentTime === null) {
    return {
      kind: 'unavailable',
      reasons: ['Enter a valid current time in whole minutes.'],
    };
  }
  if (startRaw === null || endRaw === null) {
    return {
      kind: 'unavailable',
      reasons: ['Enter both start and end times in whole minutes.'],
    };
  }

  const result = validateBooking({
    start: startRaw,
    end: endRaw,
    now: currentTime,
    blocked: room.status === 'blocked',
    bookings: room.bookings,
  });

  if (result.ok) {
    return { kind: 'available' };
  }
  return { kind: 'unavailable', reasons: result.reasons };
}

export default function App() {
  const [room, setRoom] = useState<Room>(SAMPLE_ROOM);

  function toggleRoomStatus() {
    setRoom((prev) => ({
      ...prev,
      status: prev.status === 'available' ? 'blocked' : 'available',
    }));
  }
  const [currentTimeInput, setCurrentTimeInput] = useState(
    String(DEFAULT_CURRENT_TIME_MIN)
  );
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');

  const currentTimeVal = useMemo(() => parseWholeMinute(currentTimeInput), [currentTimeInput]);

  const startVal = useMemo(() => parseWholeMinute(startInput), [startInput]);

  const endVal = useMemo(() => parseWholeMinute(endInput), [endInput]);

  const verdict = useMemo(
    () => evaluateRequest(startVal, endVal, currentTimeVal, room),
    [startVal, endVal, currentTimeVal, room]
  );

  const sortedBookings = useMemo(
    () => [...room.bookings].sort((a, b) => a.start - b.start),
    [room]
  );

  const dayStart = 480; // 08:00
  const dayEnd = 1200; // 20:00
  const daySpan = dayEnd - dayStart;

  function pct(min: number): number {
    return clamp(((min - dayStart) / daySpan) * 100, 0, 100);
  }

  const timelineNowPct = currentTimeVal !== null ? pct(currentTimeVal) : -1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
              Smart Campus Room Availability Checker
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Check whether a room is free for your requested time slot.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Room summary card */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <DoorOpen className="w-6 h-6 text-sky-600 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-base sm:text-lg font-semibold">
                  {room.name}
                </h2>
                <p className="text-sm text-slate-500">
                  {room.building} &middot; Capacity {room.capacity}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleRoomStatus}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer hover:brightness-95 ${
                room.status === 'available'
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                  : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
              }`}
              title="Click to toggle room status"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  room.status === 'available' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              {room.status === 'available' ? 'Available' : 'Blocked'}
            </button>
          </div>

          {/* Current time banner */}
          <div className="mt-4 bg-slate-50 rounded-lg px-3 py-3">
            <label
              htmlFor="current-time"
              className="flex items-center gap-2 text-sm text-slate-600"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                Current time{' '}
                <span className="text-slate-400">(min after midnight)</span>
              </span>
            </label>
            <div className="flex items-center gap-3 mt-2">
              <input
                id="current-time"
                type="number"
                min={0}
                max={1440}
                inputMode="numeric"
                value={currentTimeInput}
                onChange={(e) => setCurrentTimeInput(e.target.value)}
                className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
              <span className="text-sm text-slate-600">
                {currentTimeVal !== null
                  ? `${minutesToLabel(currentTimeVal)} (${currentTimeVal} min after midnight)`
                  : 'Enter a valid number'}
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input panel */}
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
              Request a time slot
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="start"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Start time <span className="text-slate-400">(min after midnight)</span>
                </label>
                <input
                  id="start"
                  type="number"
                  min={0}
                  max={1440}
                  inputMode="numeric"
                  placeholder="e.g. 600"
                  value={startInput}
                  onChange={(e) => setStartInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
                {startVal !== null && (
                  <p className="mt-1 text-xs text-slate-500">
                    {minutesToLabel(startVal)}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="end"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  End time <span className="text-slate-400">(min after midnight)</span>
                </label>
                <input
                  id="end"
                  type="number"
                  min={0}
                  max={1440}
                  inputMode="numeric"
                  placeholder="e.g. 660"
                  value={endInput}
                  onChange={(e) => setEndInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
                {endVal !== null && (
                  <p className="mt-1 text-xs text-slate-500">
                    {minutesToLabel(endVal)}
                  </p>
                )}
              </div>

              {startVal !== null && endVal !== null && endVal > startVal && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                  <Info className="w-4 h-4 text-slate-400" />
                  Duration: {endVal - startVal} min
                  {endVal - startVal > 120 && (
                    <span className="text-rose-600 font-medium">
                      (exceeds 120 min limit)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Verdict */}
            <div className="mt-5">
              {verdict.kind === 'available' ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-800">Available</p>
                    <p className="text-sm text-emerald-700">
                      The room is free for{' '}
                      {minutesToLabel(startVal!)}–{minutesToLabel(endVal!)}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-rose-800">Unavailable</p>
                    <ul className="mt-1 space-y-1 text-sm text-rose-700 list-disc list-inside">
                      {verdict.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Bookings + timeline */}
          <section className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Existing bookings
              </h3>
              <span className="text-xs text-slate-400">
                Intervals are [start, end)
              </span>
            </div>

            {/* Timeline */}
            <div className="mb-5">
              <div className="relative h-14 rounded-lg bg-slate-100 overflow-hidden">
                {/* gridlines */}
                {[0, 25, 50, 75, 100].map((p) => (
                  <div
                    key={p}
                    className="absolute top-0 bottom-0 border-l border-slate-200"
                    style={{ left: `${p}%` }}
                  />
                ))}
                {/* bookings */}
                {sortedBookings.map((b) => {
                  const left = pct(b.start);
                  const width = clamp(pct(b.end) - left, 0.5, 100);
                  return (
                    <div
                      key={b.id}
                      className="absolute top-1.5 bottom-1.5 rounded-md bg-sky-500/90 text-white text-[10px] leading-tight flex items-center justify-center px-1 overflow-hidden whitespace-nowrap"
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${b.title} ${minutesToLabel(b.start)}–${minutesToLabel(b.end)}`}
                    >
                      <span className="truncate">{b.title}</span>
                    </div>
                  );
                })}
                {/* current time marker */}
                {timelineNowPct >= 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-rose-500"
                    style={{ left: `${timelineNowPct}%` }}
                  >
                    <span className="absolute -top-0 -translate-y-full text-[9px] text-rose-600 font-semibold whitespace-nowrap">
                      now
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>{minutesToLabel(dayStart)}</span>
                <span>{minutesToLabel(Math.round((dayStart + dayEnd) / 2))}</span>
                <span>{minutesToLabel(dayEnd)}</span>
              </div>
            </div>

            {/* List */}
            <ul className="divide-y divide-slate-100">
              {sortedBookings.map((b) => (
                <li key={b.id} className="flex items-center gap-3 py-2.5">
                  <CalendarClock className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="text-sm text-slate-700 flex-1 truncate">
                    {b.title}
                  </span>
                  <span className="text-sm font-medium text-slate-500 tabular-nums">
                    {minutesToLabel(b.start)}–{minutesToLabel(b.end)}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Booking data is read-only and never modified.
            </p>
          </section>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 text-center text-xs text-slate-400">
        Smart Campus Room Availability Checker &middot; Demo with fictional sample data
      </footer>
    </div>
  );
}
