"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

// Fixed target launch date: September 20, 2026 at 00:00:00 IST
// Can be customized via NEXT_PUBLIC_LAUNCH_DATE environment variable or prop
const DEFAULT_LAUNCH_DATE = "2026-09-20T00:00:00+05:30";

function getTargetTimestamp(targetDate?: string): number {
  const dateStr =
    targetDate || process.env.NEXT_PUBLIC_LAUNCH_DATE || DEFAULT_LAUNCH_DATE;
  const parsed = new Date(dateStr).getTime();
  return isNaN(parsed) ? new Date(DEFAULT_LAUNCH_DATE).getTime() : parsed;
}

function calculateTimeLeft(targetTimestamp: number): TimeLeft {
  const difference = targetTimestamp - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false,
  };
}

interface CountdownTimerProps {
  targetDate?: string;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const targetTimestamp = getTargetTimestamp(targetDate);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft(targetTimestamp));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetTimestamp));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTimestamp]);

  const timeUnits = [
    { label: "DAYS", value: mounted ? timeLeft.days : 14 },
    { label: "HOURS", value: mounted ? timeLeft.hours : 8 },
    { label: "MINUTES", value: mounted ? timeLeft.minutes : 30 },
    { label: "SECONDS", value: mounted ? timeLeft.seconds : 0 },
  ];

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-4 text-center">
        <span className="text-[11px] font-semibold tracking-[0.25em] text-[#d4af37] uppercase">
          {timeLeft.isExpired
            ? "LAUNCH IN PROGRESS"
            : "COUNTDOWN TO PRIVATE LAUNCH"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
        {timeUnits.map((unit) => (
          <div
            key={unit.label}
            className="group relative flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md transition-all duration-300 hover:border-[#d4af37]/40 hover:bg-white/[0.07] hover:shadow-[0_8px_30px_rgba(212,175,55,0.12)] sm:rounded-2xl sm:p-5"
          >
            {/* Ambient inner glow */}
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-[#d4af37]/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-2xl" />

            <span className="font-serif text-2xl font-bold tracking-tight text-white tabular-nums sm:text-4xl md:text-5xl">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[9px] font-medium tracking-[0.2em] text-rose-200/70 uppercase sm:text-[11px]">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
