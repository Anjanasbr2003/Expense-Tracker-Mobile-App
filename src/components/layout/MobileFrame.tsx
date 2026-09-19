import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [showDeviceFrame, setShowDeviceFrame] = useState<boolean>(false);

  return (
    <div className="h-full w-full bg-neutral-950 flex flex-col items-center justify-center overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Desktop Helper Bar (visible only on large desktop screens) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md px-3 py-1.5 text-xs text-neutral-400">
        <div className="flex items-center gap-1.5 font-medium">
          <Smartphone size={14} className="text-emerald-400" />
          <span>Samsung Galaxy S23 Preview</span>
        </div>
        <button
          type="button"
          onClick={() => setShowDeviceFrame(!showDeviceFrame)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 font-medium text-[11px] transition-colors active:scale-95"
        >
          {showDeviceFrame ? <Monitor size={12} /> : <Smartphone size={12} />}
          <span>{showDeviceFrame ? 'Full View' : 'Device Shell'}</span>
        </button>
      </div>

      {/* Main Galaxy S23 Frame Container */}
      <div
        className={`w-full max-w-md h-full flex flex-col relative bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 overflow-hidden ${
          showDeviceFrame
            ? 'sm:h-[800px] sm:rounded-[42px] sm:shadow-2xl sm:border-[8px] sm:border-neutral-900 sm:ring-1 sm:ring-white/10'
            : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
};
