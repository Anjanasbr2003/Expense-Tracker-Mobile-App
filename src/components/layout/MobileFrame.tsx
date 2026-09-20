import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [showDeviceFrame, setShowDeviceFrame] = useState<boolean>(false);

  return (
    <div className="h-full w-full bg-[#020503] flex flex-col items-center justify-center overflow-hidden selection:bg-lime-400 selection:text-black">
      {/* Desktop Helper Bar (visible only on large desktop screens) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md px-3 py-1.5 text-xs text-emerald-400/80">
        <div className="flex items-center gap-1.5 font-medium">
          <Smartphone size={14} className="text-lime-400" />
          <span>Samsung Galaxy S23 Mobile View</span>
        </div>
        <button
          type="button"
          onClick={() => setShowDeviceFrame(!showDeviceFrame)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-emerald-500/20 hover:bg-neutral-800 text-emerald-200 font-medium text-[11px] transition-colors active:scale-95 cursor-pointer"
        >
          {showDeviceFrame ? <Monitor size={12} /> : <Smartphone size={12} />}
          <span>{showDeviceFrame ? 'Full View' : 'Device Shell'}</span>
        </button>
      </div>

      {/* Main Galaxy S23 Frame Container */}
      <div
        className={`w-full max-w-md h-full flex flex-col relative bg-slate-50 dark:bg-[#030805] text-neutral-900 dark:text-white overflow-hidden ${
          showDeviceFrame
            ? 'sm:h-[800px] sm:rounded-[44px] sm:shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_30px_rgba(34,197,94,0.15)] sm:border-[8px] sm:border-neutral-900 sm:ring-1 sm:ring-lime-400/20'
            : ''
        }`}
      >
        {/* Ambient Top Radiant Emerald Glow matching reference UI */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[160%] h-80 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.28)_0%,rgba(16,185,129,0.1)_40%,transparent_72%)] pointer-events-none z-0 dark:block hidden" />

        <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};
