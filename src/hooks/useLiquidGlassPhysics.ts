import { useEffect, useRef, useState, useCallback } from 'react';
import type { TabType } from '../components/layout/BottomNav';

export interface LiquidGlassPhysicsState {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  velocity: number;
  highlightOffset: number;
  leadingEdgeGlow: number;
  direction: 'left' | 'right' | 'idle';
  isSettled: boolean;
  isReady: boolean;
}

export function useLiquidGlassPhysics(
  activeTab: TabType,
  tabRefs: Record<TabType, React.RefObject<HTMLButtonElement | null>>,
  containerRef: React.RefObject<HTMLDivElement | null>
): LiquidGlassPhysicsState {
  const [physicsState, setPhysicsState] = useState<LiquidGlassPhysicsState>({
    x: 0,
    y: 6,
    width: 56,
    height: 50,
    scaleX: 1,
    scaleY: 1,
    velocity: 0,
    highlightOffset: 0,
    leadingEdgeGlow: 0,
    direction: 'idle',
    isSettled: true,
    isReady: false,
  });

  const prevXRef = useRef<number>(0);
  const isInitialRef = useRef<boolean>(true);

  // Calculate target position from live DOM rects
  const calculateTarget = useCallback((): { x: number; y: number; width: number; height: number } | null => {
    const activeBtn = tabRefs[activeTab]?.current;
    const container = containerRef.current;

    if (!activeBtn || !container) return null;

    const btnRect = activeBtn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Generous capsule padding so the entire tab element (icon + label) is completely contained
    const height = Math.min(Math.max(containerRect.height - 12, 46), 52);
    const y = Math.max(0, (containerRect.height - height) / 2);
    // Hug button footprint with comfortable insets; cap width to 58px so it never overlaps the center + action button
    const width = Math.min(Math.max(btnRect.width - 10, 48), 58);
    const x = btnRect.left - containerRect.left + (btnRect.width - width) / 2;

    return { x, y, width, height };
  }, [activeTab, tabRefs, containerRef]);

  // Update position on tab change
  useEffect(() => {
    const target = calculateTarget();
    if (!target) return;

    const prevX = prevXRef.current;
    const dir: 'left' | 'right' | 'idle' =
      isInitialRef.current || prevX === target.x
        ? 'idle'
        : target.x > prevX
        ? 'right'
        : 'left';

    prevXRef.current = target.x;
    isInitialRef.current = false;

    setPhysicsState({
      x: target.x,
      y: target.y,
      width: target.width,
      height: target.height,
      scaleX: 1,
      scaleY: 1,
      velocity: 0,
      highlightOffset: 0,
      leadingEdgeGlow: 0,
      direction: dir,
      isSettled: true,
      isReady: true,
    });
  }, [activeTab, calculateTarget]);

  // Handle window resizing to keep alignment perfectly synchronized
  useEffect(() => {
    const handleResize = () => {
      const target = calculateTarget();
      if (!target) return;
      prevXRef.current = target.x;

      setPhysicsState((prev) => ({
        ...prev,
        x: target.x,
        y: target.y,
        width: target.width,
        height: target.height,
        direction: 'idle',
        isSettled: true,
        isReady: true,
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateTarget]);

  return physicsState;
}
