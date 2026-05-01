import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function CustomDropdown({ options, value, onChange, label, placeholder = 'SELECT...', className = '' }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className={`text-[10px] font-black uppercase tracking-[0.3em] ml-2 mb-2 block ${className.includes('blue-label') ? 'text-blue-500' : 'text-white/30'}`}>
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/[0.03] border-2 border-white/10 rounded-2xl py-4 px-6 flex items-center justify-between group hover:border-white/20 transition-all font-bold text-sm"
      >
        <span className={selectedOption ? 'text-white' : 'text-white/20'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`text-white/20 group-hover:text-brand transition-all ${isOpen ? 'rotate-180 text-brand' : ''}`} />
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
              className="absolute top-full mt-4 left-0 w-full bg-[#0a0a0a] border-2 border-white/10 rounded-3xl overflow-hidden shadow-2xl z-[120] backdrop-blur-2xl"
            >
              <div className="max-h-60 overflow-y-auto">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-6 py-4 text-xs font-bold transition-all border-b border-white/5 last:border-0
                      ${value === option.value ? 'bg-brand/10 text-brand' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                    `}
                  >
                    <span className="uppercase tracking-widest">{option.label}</span>
                    {value === option.value && <Check size={14} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
