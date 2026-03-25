import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { CaseWithId } from "../hooks/useQueries";

interface CaseCalendarProps {
  cases: CaseWithId[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CaseCalendar({ cases }: CaseCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Build set of day keys with cases: "YYYY-MM-DD"
  const caseDateKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const c of cases) {
      const d = new Date(Number(c.nextDate));
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      keys.add(key);
    }
    return keys;
  }, [cases]);

  // Build calendar grid
  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid: { day: number | null; key: string }[] = [];
    for (let i = 0; i < firstDay; i++)
      grid.push({ day: null, key: `empty-${i}` });
    for (let d = 1; d <= daysInMonth; d++)
      grid.push({ day: d, key: `day-${d}` });
    // Pad to complete rows
    let pad = 0;
    while ((grid.length + pad) % 7 !== 0) pad++;
    for (let i = 0; i < pad; i++) grid.push({ day: null, key: `end-${i}` });
    return grid;
  }, [year, month]);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  const hasCase = (day: number) => caseDateKeys.has(`${year}-${month}-${day}`);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: "oklch(var(--header))" }}
      >
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <span className="text-white font-semibold text-sm">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center py-2 text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 p-2 gap-1">
        {days.map(({ day, key }) => {
          if (!day) {
            return <div key={key} className="aspect-square" />;
          }
          const todayDay = isToday(day);
          const caseDay = hasCase(day);
          return (
            <div
              key={key}
              className={`aspect-square flex items-center justify-center rounded-full text-xs font-medium transition-colors
                ${
                  caseDay
                    ? "bg-red-500 text-white font-bold"
                    : todayDay
                      ? "bg-primary/15 text-primary font-bold"
                      : "text-foreground hover:bg-muted"
                }
              `}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {cases.length > 0 && (
        <div className="px-4 pb-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Hearing date</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary/15" />
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
        </div>
      )}
    </div>
  );
}
