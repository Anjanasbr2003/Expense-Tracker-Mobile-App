import React from 'react';
import type { LiquidGlassPhysicsState } from '../../hooks/useLiquidGlassPhysics';

interface LiquidGlassCapsuleProps {
  physics: LiquidGlassPhysicsState;
}

export const LiquidGlassCapsule: React.FC<LiquidGlassCapsuleProps> = ({ physics }) => {
  if (!physics.isReady) return null;

  const {
    x,
    y,
    width,
    height,
    scaleX,
    scaleY,
    highlightOffset,
    leadingEdgeGlow,
    direction,
  } = physics;

  // Fluid directional transform origin: stretches backwards from movement direction
  const transformOrigin =
    direction === 'right'
      ? 'left center'
      : direction === 'left'
      ? 'right center'
      : 'center center';

  return (
    <div
      className="absolute top-0 left-0 pointer-events-none z-10 will-change-transform"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate3d(${x}px, ${y}px, 0) scale(${scaleX}, ${scaleY})`,
        transformOrigin,
        transition: physics.isSettled ? 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
      }}
      aria-hidden="true"
    >
      {/* Outer Layer: Ambient Depth Shadow & Border */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-lime-400/40 dark:border-lime-400/35 shadow-[0_4px_20px_rgba(0,0,0,0.35),0_0_12px_rgba(163,230,53,0.18)]">
        {/* Layer 1: Backdrop Blur & Translucent Glass Body */}
        <div className="absolute inset-0 bg-white/65 dark:bg-[#13301f]/80 backdrop-blur-xl saturate-180" />

        {/* Layer 2: Subtle internal refractive gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/10 dark:from-white/10 dark:via-transparent dark:to-black/30" />

        {/* Layer 3: Moving Specular Light Sheen (shifted horizontally by velocity) */}
        <div
          className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/40 dark:via-lime-300/25 to-transparent blur-[2px] transition-transform duration-75"
          style={{
            transform: `translateX(${width / 2 - 16 + highlightOffset}px)`,
          }}
        />

        {/* Layer 4: Leading Edge Specular Flash (illuminates along movement edge) */}
        {leadingEdgeGlow > 0.05 && (
          <div
            className={`absolute inset-y-0 w-2.5 bg-gradient-to-r from-lime-300/60 to-transparent blur-[1px] transition-opacity duration-100 ${
              direction === 'right' ? 'right-0 -scale-x-100' : 'left-0'
            }`}
            style={{ opacity: leadingEdgeGlow }}
          />
        )}

        {/* Layer 5: Top rim specular hairline highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-lime-300/60 to-transparent" />

        {/* Layer 6: Micro Active Focal Pip */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-lime-400 dark:bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,1)]" />
      </div>
    </div>
  );
};
