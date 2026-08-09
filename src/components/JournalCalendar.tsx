import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { JournalEntry } from '../types';

interface JournalCalendarProps {
  entries: JournalEntry[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
}

export const JournalCalendar: React.FC<JournalCalendarProps> = ({
  entries,
  selectedDate,
  onSelectDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Mapping tanggal yang memiliki catatan -> Set("YYYY-MM-DD")
  const entryDatesSet = new Set(
    entries.map((e) => e.createdAt ? e.createdAt.split('T')[0] : '')
  );

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="neu-card p-5 space-y-4 text-left">
      {/* Month Navigation */}
      <div className="flex items-center justify-between text-sm font-semibold text-ink px-1">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-full neu-button flex items-center justify-center text-ink-muted hover:text-ink cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-display font-bold text-base">
          {monthNames[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-full neu-button flex items-center justify-center text-ink-muted hover:text-ink cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 text-center text-[10px] font-mono text-ink-muted uppercase tracking-wider">
        <span>Min</span>
        <span>Sen</span>
        <span>Sel</span>
        <span>Rab</span>
        <span>Kam</span>
        <span>Jum</span>
        <span>Sab</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-mono">
        {/* Empty slots before first day */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}

        {/* Month Days */}
        {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
          const dayNum = dayIndex + 1;
          const formattedDay = dayNum.toString().padStart(2, '0');
          const formattedMonth = (month + 1).toString().padStart(2, '0');
          const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

          const hasEntry = entryDatesSet.has(dateStr);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`h-9 rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                isSelected
                  ? 'neu-inset text-accent font-bold scale-[0.96]'
                  : hasEntry
                  ? 'neu-raised-sm text-accent font-semibold hover:scale-105'
                  : 'text-ink-muted hover:neu-raised-sm hover:text-ink'
              }`}
            >
              <span>{dayNum}</span>
              {hasEntry && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="flex items-center justify-between text-xs pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
          <span className="text-ink-muted">
            Filter: <strong className="text-accent">{selectedDate}</strong>
          </span>
          <button
            onClick={() => onSelectDate(null)}
            className="neu-pill px-3 py-1 text-accent font-mono text-[10px] hover:neu-inset-sm transition-all cursor-pointer"
          >
            Tampilkan Semua
          </button>
        </div>
      )}
    </div>
  );
};
