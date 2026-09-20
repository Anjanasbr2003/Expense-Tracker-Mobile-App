import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CategoryIcon, AVAILABLE_CATEGORY_ICONS } from './CategoryIcon';
import { ChevronDown, Search, X } from 'lucide-react';
import { hapticLight } from '../../utils/haptics';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  accentColor?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  accentColor = '#10b981',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredIcons = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return AVAILABLE_CATEGORY_ICONS;
    return AVAILABLE_CATEGORY_ICONS.filter((icon) =>
      icon.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelect = (iconName: string) => {
    hapticLight();
    onChange(iconName);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* 1. Interactive Visual Trigger (Replaces broken native HTML <select>) */}
      <button
        type="button"
        onClick={() => {
          hapticLight();
          setIsOpen(true);
        }}
        className="flex-1 flex items-center justify-between px-3 py-2 text-xs rounded-xl glass-panel text-neutral-900 dark:text-white border border-lime-400/20 hover:border-lime-400/40 active:scale-95 transition-all cursor-pointer"
        aria-label="Choose Category Icon"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
            style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
          >
            <CategoryIcon name={value} size={15} />
          </div>
          <span className="font-semibold text-xs truncate">{value}</span>
        </div>
        <ChevronDown size={14} className="text-neutral-400 shrink-0 ml-1.5" />
      </button>

      {/* 2. Visual Icon Palette Modal (No empty native dialogs!) */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#030805]/85 backdrop-blur-xl animate-in fade-in duration-150 select-none overscroll-contain"
          onClick={() => {
            setIsOpen(false);
            setSearchQuery('');
          }}
        >
          <div
            className="w-full max-w-md max-h-[80vh] flex flex-col rounded-t-3xl sm:rounded-3xl glass-emerald-card border border-lime-400/35 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(34,197,94,0.25)] p-5 animate-scale-check"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div>
                <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  Choose Category Icon
                </h3>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-300/80 font-medium">
                  {AVAILABLE_CATEGORY_ICONS.length} suitable icons available
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className="w-7 h-7 rounded-full glass-button text-neutral-400 hover:text-white flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Live Search Input */}
            <div className="relative mb-3 shrink-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search icons (e.g. food, car, gym, wifi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-xl glass-panel text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/30 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Scrollable Visual Icon Grid */}
            <div className="flex-1 overflow-y-auto no-scrollbar pr-1 grid grid-cols-5 gap-2 pb-2">
              {filteredIcons.map((iconName) => {
                const isSelected = value === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleSelect(iconName)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all cursor-pointer aspect-square ${
                      isSelected
                        ? 'bg-lime-400/20 border-2 border-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.35)]'
                        : 'glass-panel hover:border-lime-400/30 active:scale-90'
                    }`}
                    title={iconName}
                  >
                    <div
                      className={`transition-transform duration-150 ${
                        isSelected ? 'scale-110 text-lime-400' : 'text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      <CategoryIcon name={iconName} size={22} />
                    </div>
                    <span className="text-[9px] font-semibold text-neutral-500 dark:text-neutral-400 mt-1 truncate max-w-full text-center leading-none">
                      {iconName}
                    </span>
                  </button>
                );
              })}

              {filteredIcons.length === 0 && (
                <div className="col-span-5 py-8 text-center text-xs text-neutral-500">
                  No matching icons found for "{searchQuery}"
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className="w-full py-2 rounded-xl glass-button text-xs font-semibold text-neutral-300 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
