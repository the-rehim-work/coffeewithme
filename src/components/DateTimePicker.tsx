"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
  getDay,
} from "date-fns";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function buildDatetimeString(
  date: Date,
  h12: number,
  min: number,
  pm: boolean
): string {
  const hour24 = pm ? (h12 === 12 ? 12 : h12 + 12) : h12 === 12 ? 0 : h12;
  const d = new Date(date);
  d.setHours(hour24, min, 0, 0);
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export default function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const parsed = value ? new Date(value) : null;

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => parsed ?? new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(parsed);
  const [hour12, setHour12] = useState(() => {
    if (parsed) {
      const h = parsed.getHours();
      return h === 0 ? 12 : h > 12 ? h - 12 : h;
    }
    return 2;
  });
  const [minute, setMinute] = useState(() => parsed?.getMinutes() ?? 0);
  const [isPm, setIsPm] = useState(() => (parsed ? parsed.getHours() >= 12 : true));

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(viewMonth),
      end: endOfMonth(viewMonth),
    });
  }, [viewMonth]);

  const startOffset = getDay(startOfMonth(viewMonth));

  const handleDayClick = (day: Date) => {
    if (isBefore(startOfDay(day), startOfDay(new Date()))) return;
    setSelectedDate(day);
    onChange(buildDatetimeString(day, hour12, minute, isPm));
  };

  const changeHour = (delta: number) => {
    const next = ((hour12 - 1 + delta + 12) % 12) + 1;
    setHour12(next);
    if (selectedDate) onChange(buildDatetimeString(selectedDate, next, minute, isPm));
  };

  const changeMinute = (delta: number) => {
    const next = (minute + delta * 5 + 60) % 60;
    setMinute(next);
    if (selectedDate) onChange(buildDatetimeString(selectedDate, hour12, next, isPm));
  };

  const changeAmPm = (pm: boolean) => {
    setIsPm(pm);
    if (selectedDate) onChange(buildDatetimeString(selectedDate, hour12, minute, pm));
  };

  const displayLabel = parsed ? format(parsed, "EEE, MMM d · h:mm a") : null;
  const confirmLabel = selectedDate && value
    ? `Confirm — ${format(new Date(value), "EEE, MMM d · h:mm a")}`
    : "Select a date first";

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full bg-dark-card border rounded-2xl px-5 py-4 text-left transition-colors ${
          open ? "border-coffee-600" : "border-dark-border hover:border-coffee-900"
        }`}
      >
        <p className="text-coffee-600 text-xs uppercase tracking-widest mb-1.5">
          Date &amp; Time
        </p>
        {displayLabel ? (
          <p className="text-coffee-100 font-semibold text-[15px]">{displayLabel}</p>
        ) : (
          <p className="text-coffee-700 text-[15px]">Choose when to meet…</p>
        )}
      </button>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute z-50 top-full mt-2 left-0 right-0 bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Month nav */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <button
                type="button"
                onClick={() => setViewMonth((m) => subMonths(m, 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-coffee-500 hover:text-coffee-200 hover:bg-dark-elevated transition-colors text-xl leading-none"
              >
                ‹
              </button>
              <span className="text-coffee-100 font-semibold text-sm tracking-wide">
                {format(viewMonth, "MMMM yyyy")}
              </span>
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-coffee-500 hover:text-coffee-200 hover:bg-dark-elevated transition-colors text-xl leading-none"
              >
                ›
              </button>
            </div>

            {/* Calendar grid */}
            <div className="px-4 pb-2">
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-coffee-700 text-xs py-1.5 font-medium"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-0.5">
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`e${i}`} />
                ))}
                {days.map((day) => {
                  const past = isBefore(startOfDay(day), startOfDay(new Date()));
                  const sel = selectedDate && isSameDay(day, selectedDate);
                  const tod = isToday(day);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={past}
                      onClick={() => handleDayClick(day)}
                      className={[
                        "h-9 w-full rounded-lg text-sm font-medium transition-all",
                        past ? "text-coffee-900 cursor-not-allowed" : "cursor-pointer",
                        sel
                          ? "bg-coffee-700 text-coffee-50 shadow-md"
                          : tod
                          ? "text-coffee-300 ring-1 ring-coffee-700 hover:bg-dark-elevated"
                          : !past
                          ? "text-coffee-300 hover:bg-dark-elevated"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dark-border mx-4" />

            {/* Time picker */}
            <div className="px-5 py-4">
              <p className="text-coffee-700 text-xs uppercase tracking-widest mb-4 text-center">
                Time
              </p>
              <div className="flex items-center justify-center gap-2">
                {/* Hours */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => changeHour(1)}
                    className="w-10 h-7 flex items-center justify-center rounded-lg text-coffee-600 hover:text-coffee-200 hover:bg-dark-elevated transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <div className="w-14 h-12 bg-dark-elevated border border-dark-border rounded-xl flex items-center justify-center text-coffee-100 font-bold text-2xl tabular-nums">
                    {pad(hour12)}
                  </div>
                  <button
                    type="button"
                    onClick={() => changeHour(-1)}
                    className="w-10 h-7 flex items-center justify-center rounded-lg text-coffee-600 hover:text-coffee-200 hover:bg-dark-elevated transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <span className="text-coffee-500 font-bold text-3xl mb-0.5">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => changeMinute(1)}
                    className="w-10 h-7 flex items-center justify-center rounded-lg text-coffee-600 hover:text-coffee-200 hover:bg-dark-elevated transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <div className="w-14 h-12 bg-dark-elevated border border-dark-border rounded-xl flex items-center justify-center text-coffee-100 font-bold text-2xl tabular-nums">
                    {pad(minute)}
                  </div>
                  <button
                    type="button"
                    onClick={() => changeMinute(-1)}
                    className="w-10 h-7 flex items-center justify-center rounded-lg text-coffee-600 hover:text-coffee-200 hover:bg-dark-elevated transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* AM / PM */}
                <div className="flex flex-col gap-1.5 ml-2">
                  {(["AM", "PM"] as const).map((label) => {
                    const active = label === "PM" ? isPm : !isPm;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => changeAmPm(label === "PM")}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          active
                            ? "bg-coffee-700 text-coffee-50 shadow"
                            : "text-coffee-600 hover:bg-dark-elevated hover:text-coffee-400"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Confirm */}
            <div className="px-4 pb-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={!selectedDate}
                className="w-full bg-coffee-800 hover:bg-coffee-700 disabled:opacity-25 disabled:cursor-not-allowed text-coffee-100 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
