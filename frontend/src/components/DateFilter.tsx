/**
 * Compact month and year filters for expense history.
 */

import { Calendar, ChevronDown } from "lucide-react";

interface DateFilterProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

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

export function DateFilter({
  currentMonth,
  currentYear,
  onMonthChange,
  onYearChange,
}: DateFilterProps) {
  const baseYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, index) => baseYear - 5 + index);

  const selectClassName =
    "h-9 appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-sm font-medium text-slate-700 shadow-sm outline-none transition-colors hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <Calendar className="size-4" aria-hidden="true" />
        <span>Filter by</span>
      </div>

      <div className="relative">
        <label htmlFor="expense-month-filter" className="sr-only">
          Filter by month
        </label>
        <select
          id="expense-month-filter"
          value={currentMonth}
          onChange={(event) => onMonthChange(Number(event.target.value))}
          className={selectClassName}
        >
          {MONTHS.map((month, index) => (
            <option key={month} value={index + 1}>
              {month}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
      </div>

      <div className="relative">
        <label htmlFor="expense-year-filter" className="sr-only">
          Filter by year
        </label>
        <select
          id="expense-year-filter"
          value={currentYear}
          onChange={(event) => onYearChange(Number(event.target.value))}
          className={selectClassName}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}