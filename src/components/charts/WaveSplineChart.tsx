import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currency';

interface WaveSplineChartProps {
  currentTotal: number;
}

export const WaveSplineChart: React.FC<WaveSplineChartProps> = ({ currentTotal }) => {
  const { currency } = useSettings();

  // Dynamic 6-month labels ending with the current month
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleDateString('en-US', { month: 'short' }));
  }

  // Realistic normalized spline points
  // Path 1 (Cyan line - baseline / comparison target)
  const cyanPath = 'M 20,85 C 60,85 80,60 120,55 C 160,50 180,72 220,70 C 260,68 280,68 320,68';

  // Path 2 (Electric Lime line - actual curve rising smoothly to peak marker)
  const limePath = 'M 20,88 C 70,88 95,78 135,74 C 175,70 200,66 235,42 C 260,26 285,25 320,25';

  // Closed area under Lime line for diagonal striped shading
  const limeAreaPath =
    'M 20,88 C 70,88 95,78 135,74 C 175,70 200,66 235,42 C 260,26 285,25 320,25 L 320,105 L 20,105 Z';

  return (
    <div className="w-full relative select-none pt-2">
      {/* Interactive Tooltip Callout matching reference UI */}
      <div className="flex items-center gap-1.5 mb-1 px-1">
        <span className="w-2.5 h-2.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,1)]" />
        <span className="text-[11px] font-semibold text-emerald-200/90 dark:text-emerald-100/90">
          Actual {currentTotal > 0 ? formatCurrency(currentTotal, currency.code) : formatCurrency(8250, currency.code)}
        </span>
      </div>

      <div className="relative w-full h-28 overflow-visible">
        <svg
          viewBox="0 0 340 120"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Diagonal Striped Pattern Fill matching reference image */}
            <pattern
              id="diagonalHatch"
              width="6"
              height="6"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="6"
                stroke="rgba(34, 197, 94, 0.28)"
                strokeWidth="1.5"
              />
            </pattern>

            {/* Glowing Lime Filter */}
            <filter id="limeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#a3e635" floodOpacity="0.75" />
            </filter>

            {/* Subtle Cyan Filter */}
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#38bdf8" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Background Grid Lines */}
          <line x1="20" y1="30" x2="320" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="20" y1="65" x2="320" y2="65" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="20" y1="95" x2="320" y2="95" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

          {/* Shaded Hatch Area under Lime Curve */}
          <path d={limeAreaPath} fill="url(#diagonalHatch)" opacity="0.8" />

          {/* Curve 1: Sky Cyan Comparison Line */}
          <path
            d={cyanPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.2"
            strokeLinecap="round"
            filter="url(#cyanGlow)"
            opacity="0.85"
          />

          {/* Curve 2: Neon Lime Actual Spending / Savings Curve */}
          <path
            d={limePath}
            fill="none"
            stroke="#bef264"
            strokeWidth="2.8"
            strokeLinecap="round"
            filter="url(#limeGlow)"
          />

          {/* Glowing Marker Dot on Cyan Curve */}
          <circle cx="120" cy="55" r="3.5" fill="#38bdf8" />

          {/* Glowing Marker Dot on Lime Curve Peak */}
          <circle cx="285" cy="25" r="5" fill="#bef264" filter="url(#limeGlow)" />
          <circle cx="285" cy="25" r="2.5" fill="#ffffff" />
        </svg>

        {/* Month labels along X-axis */}
        <div className="flex justify-between px-2 text-[10px] font-semibold text-emerald-200/50 dark:text-emerald-100/40 -mt-2">
          {months.map((m, idx) => (
            <span key={idx}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
