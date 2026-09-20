import React from 'react';
import type { LiquidGlassPhysicsState } from '../../hooks/useLiquidGlassPhysics';

interface LiquidGlassCapsuleProps {
  physics: LiquidGlassPhysicsState;
}

export const LiquidGlassCapsule: React.FC<LiquidGlassCapsuleProps> = ({ physics }) => {
  if (!physics.isReady) return null;

  const { x, y, width, height } = physics;

  return (
    <div
      className="absolute top-0 left-0 pointer-events-none z-10 will-change-transform transition-[transform,width,height] duration-300 ease-[cubic-bezier(0.2,0.9,0.28,1)]"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate3d(${x}px, ${y}px, 0)`,
      }}
      aria-hidden="true"
    >
      {/* Outer Layer: Ambient Depth Shadow & Border */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-lime-400/45 dark:border-lime-400/35 shadow-[0_2px_12px_rgba(163,230,53,0.18),0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4),0_0_12px_rgba(163,230,53,0.2)]">
        {/* Layer 1: Backdrop Blur & Translucent Glass Body */}
        <div className="absolute inset-0 bg-white/75 dark:bg-[#13301f]/85 backdrop-blur-md" />

        {/* Layer 2: Subtle internal refractive gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/5 dark:from-white/10 dark:via-transparent dark:to-black/30" />

        {/* Layer 3: Moving Specular Light Sheen */}
        <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/40 dark:via-lime-300/20 to-transparent blur-[2px] left-1/2 -translate-x-1/2" />

        {/* Layer 4: Top rim specular hairline highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 dark:via-lime-300/60 to-transparent" />
      </div>
    </div>
  );
};
