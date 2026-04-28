import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval } from 'date-fns';

interface CustomCalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  className?: string;
}

export default function CustomCalendar({ selected, onSelect, className = '' }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/[0.03] border-2 border-white/10 rounded-2xl py-4 px-6 flex items-center justify-between group hover:border-white/20 transition-all font-bold text-sm"
      >
        <div className="flex items-center gap-3">
          <CalendarIcon size={18} className="text-white/20 group-hover:text-brand transition-colors" />
          <span className={selected ? 'text-white' : 'text-white/20'}>
            {selected ? format(selected, 'dd MMMM yyyy') : 'SELECT DATE...'}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full mt-4 left-0 w-80 bg-[#0a0a0a] border-2 border-white/10 rounded-3xl p-6 shadow-2xl z-[120] backdrop-blur-2xl"
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                  {format(currentMonth, 'MMMM yyyy')}
                </h4>
                <div className="flex gap-1">
                  <button type="button" onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
                    <ChevronLeft size={16} />
                  </button>
                  <button type="button" onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div key={`${day}-${idx}`} className="text-[8px] font-black text-center text-white/20 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  const isSelected = selected && isSameDay(day, selected);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onSelect(day);
                        setIsOpen(false);
                      }}
                      className={`
                        aspect-square flex items-center justify-center rounded-xl text-[10px] font-bold transition-all
                        ${isSelected ? 'bg-brand text-black shadow-lg shadow-brand/20' : ''}
                        ${!isSelected && isCurrentMonth ? 'text-white hover:bg-white/5' : ''}
                        ${!isSelected && !isCurrentMonth ? 'text-white/10' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
