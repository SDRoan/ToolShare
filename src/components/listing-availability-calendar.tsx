import type { ListingAvailabilityRange } from "@/lib/data";
import { cn, formatDateRange, getTodayDateValue } from "@/lib/utils";

type ListingAvailabilityCalendarProps = {
  blockedRanges: ListingAvailabilityRange[];
};

type CalendarDay = {
  dateValue: string;
  dayOfMonth: number;
  isBooked: boolean;
  isOutsideMonth: boolean;
  isToday: boolean;
};

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function buildCalendarMonth(baseDate: Date, blockedRanges: ListingAvailabilityRange[]) {
  const monthStart = startOfMonth(baseDate);
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const today = getTodayDateValue();
  const days: CalendarDay[] = [];

  for (let index = 0; index < 42; index += 1) {
    const currentDate = addDays(gridStart, index);
    const dateValue = formatDateValue(currentDate);

    days.push({
      dateValue,
      dayOfMonth: currentDate.getDate(),
      isBooked: blockedRanges.some((range) => range.start_date <= dateValue && range.end_date >= dateValue),
      isOutsideMonth: currentDate.getMonth() !== baseDate.getMonth(),
      isToday: dateValue === today
    });
  }

  return {
    label: baseDate.toLocaleString("en-US", {
      month: "long",
      year: "numeric"
    }),
    days
  };
}

export function ListingAvailabilityCalendar({ blockedRanges }: ListingAvailabilityCalendarProps) {
  const currentMonth = startOfMonth(new Date());
  const calendarMonths = [currentMonth, addMonths(currentMonth, 1)].map((month) =>
    buildCalendarMonth(month, blockedRanges)
  );

  return (
    <section className="mt-8 rounded-[2rem] bg-canvas p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Availability</div>
          <h2 className="mt-2 font-display text-3xl text-ink">Plan around booked borrow windows</h2>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
          <span className="rounded-full bg-white px-3 py-2 text-slate-500">Open</span>
          <span className="rounded-full bg-teal-600 px-3 py-2 text-white">Booked</span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-600">
        Accepted and active borrows blackout those dates so new requests do not overlap.
      </p>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {calendarMonths.map((month) => (
          <div key={month.label} className="rounded-[1.5rem] border border-white/70 bg-white/85 p-4 shadow-soft">
            <div className="text-lg font-semibold text-ink">{month.label}</div>
            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
                <div key={label}>{label}</div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {month.days.map((day) => (
                <div
                  key={day.dateValue}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-2xl text-sm font-semibold",
                    day.isBooked ? "bg-teal-600 text-white" : "bg-canvas text-slate-700",
                    day.isOutsideMonth && !day.isBooked && "text-slate-300",
                    day.isToday && !day.isBooked && "ring-2 ring-teal-200"
                  )}
                >
                  {day.dayOfMonth}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Upcoming blackouts</div>
        {blockedRanges.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {blockedRanges.slice(0, 6).map((range) => (
              <span key={range.id} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                {formatDateRange(range.start_date, range.end_date)}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-7 text-slate-600">No accepted borrows are blocking the calendar right now.</p>
        )}
      </div>
    </section>
  );
}
