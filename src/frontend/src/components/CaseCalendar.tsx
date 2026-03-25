import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "adjourned":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "disposed":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
}

export default function CaseCalendar({ cases }: CaseCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const caseDateMap = useMemo(() => {
    const map = new Map<string, CaseWithId[]>();
    for (const c of cases) {
      const d = new Date(Number(c.nextDate));
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return map;
  }, [cases]);

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid: { day: number | null; key: string }[] = [];
    for (let i = 0; i < firstDay; i++)
      grid.push({ day: null, key: `empty-${i}` });
    for (let d = 1; d <= daysInMonth; d++)
      grid.push({ day: d, key: `day-${d}` });
    let pad = 0;
    while ((grid.length + pad) % 7 !== 0) pad++;
    for (let i = 0; i < pad; i++) grid.push({ day: null, key: `end-${i}` });
    return grid;
  }, [year, month]);

  const prevMonth = () => {
    setSelectedDate(null);
    setViewDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setSelectedDate(null);
    setViewDate(new Date(year, month + 1, 1));
  };

  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  const hasCase = (day: number) => caseDateMap.has(`${year}-${month}-${day}`);

  const isSelected = (day: number) =>
    selectedDate?.year === year &&
    selectedDate?.month === month &&
    selectedDate?.day === day;

  const handleDayClick = (day: number) => {
    if (!hasCase(day)) return;
    if (isSelected(day)) {
      setSelectedDate(null);
    } else {
      setSelectedDate({ year, month, day });
    }
  };

  const selectedCases = useMemo(() => {
    if (!selectedDate) return [];
    return (
      caseDateMap.get(
        `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`,
      ) || []
    );
  }, [selectedDate, caseDateMap]);

  const selectedDateFormatted = selectedDate
    ? new Date(
        selectedDate.year,
        selectedDate.month,
        selectedDate.day,
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        weekday: "long",
      })
    : "";

  return (
    <div className="space-y-3">
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
            const selectedDay = isSelected(day);
            return (
              <div
                key={key}
                role={caseDay ? "button" : undefined}
                tabIndex={caseDay ? 0 : undefined}
                onClick={() => handleDayClick(day)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleDayClick(day);
                }}
                className={`aspect-square flex items-center justify-center rounded-full text-xs font-medium transition-colors
                  ${
                    selectedDay
                      ? "bg-red-700 text-white font-bold ring-2 ring-red-400"
                      : caseDay
                        ? "bg-red-500 text-white font-bold cursor-pointer hover:bg-red-600"
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
              <span className="text-xs text-muted-foreground">
                Hearing date (tap to view)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary/15" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected date cases panel */}
      <AnimatePresence>
        {selectedDate && selectedCases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-card rounded-2xl border border-red-200 shadow-card overflow-hidden"
            data-ocid="calendar.panel"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-red-50 border-b border-red-200">
              <div>
                <p className="text-xs font-bold text-red-800 uppercase tracking-wider">
                  Hearings on
                </p>
                <p className="text-sm font-semibold text-red-900">
                  {selectedDateFormatted}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors"
                aria-label="Close"
                data-ocid="calendar.close_button"
              >
                <X className="w-4 h-4 text-red-700" />
              </button>
            </div>
            <div className="divide-y divide-border">
              {selectedCases.map((c, i) => (
                <div
                  key={`${String(c.id)}-${i}`}
                  className="px-4 py-3 space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground leading-snug flex-1">
                      {c.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium px-2 py-0.5 shrink-0 ${getStatusColor(c.status)}`}
                    >
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.refNumber}</p>
                  {c.court && (
                    <p className="text-xs text-muted-foreground">{c.court}</p>
                  )}
                  {c.hearingReason && (
                    <p className="text-xs text-muted-foreground italic">
                      {c.hearingReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
