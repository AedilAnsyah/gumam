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
    <div className="bg-surface border border-surface-alt rounded-2xl p-4 space-y-3 shadow-md">
      {/* Month Navigation */}
      <div className="flex items-center justify-between text-sm font-semibold text-ink px-1">
        <button
          onClick={prevMonth}
          className="p-1 rounded-lg hover:bg-surface-alt text-ink-muted hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-display">
          {monthNames[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 rounded-lg hover:bg-surface-alt text-ink-muted hover:text-ink transition-colors"
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
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono">
        {/* Empty slots before first day */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
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
              className={`h-8 rounded-xl flex flex-col items-center justify-center relative transition-all ${
                isSelected
                  ? 'bg-accent text-canvas font-bold shadow-md scale-105'
                  : hasEntry
                  ? 'bg-surface-alt text-accent font-semibold hover:bg-accent/20'
                  : 'text-ink-muted hover:bg-surface-alt/50 hover:text-ink'
              }`}
            >
              <span>{dayNum}</span>
              {hasEntry && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent absolute bottom-1 shadow-sm" />
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="flex items-center justify-between text-xs pt-2 border-t border-surface-alt/60">
          <span className="text-ink-muted">
            Filter: <strong className="text-accent">{selectedDate}</strong>
          </span>
          <button
            onClick={() => onSelectDate(null)}
            className="text-accent hover:underline font-mono text-[11px]"
          >
            Tampilkan Semua
          </button>
        </div>
      )}
    </div>
  );
};
