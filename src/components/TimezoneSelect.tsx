import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export const TimezoneSelect = ({ value, onChange, className }: { value: string, onChange: (val: string) => void, className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const timezones = useMemo(() => { try { return (Intl as any).supportedValuesOf('timeZone'); } catch(e) { return ['Europe/Lisbon', 'America/Sao_Paulo', 'Europe/London', 'America/New_York']; } }, []);

  const filteredTimezones = useMemo(() => {
    if (!search) return timezones;
    const lowerSearch = search.toLowerCase();
    return timezones.filter(tz => tz.toLowerCase().includes(lowerSearch));
  }, [timezones, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayValue = value ? value.replace(/_/g, ' ') : '';

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div 
        className={`flex items-center justify-between cursor-pointer ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{displayValue || 'Select Timezone'}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input 
              type="text" 
              className="w-full text-sm outline-none placeholder:text-slate-400" 
              placeholder="Search timezone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            {filteredTimezones.map(tz => (
              <div 
                key={tz}
                className={`px-3 py-2 text-sm rounded-lg cursor-pointer flex items-center justify-between hover:bg-purple-50 ${tz === value ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700'}`}
                onClick={() => {
                  onChange(tz);
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                <span className="truncate">{tz.replace(/_/g, ' ')}</span>
                {tz === value && <Check className="w-4 h-4" />}
              </div>
            ))}
            {filteredTimezones.length === 0 && (
              <div className="px-3 py-4 text-sm text-center text-slate-500">No timezones found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
