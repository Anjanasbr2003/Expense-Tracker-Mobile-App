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
  // Current dynamic state rendered to the capsule
  const [physicsState, setPhysicsState] = useState<LiquidGlassPhysicsState>({
    x: 0,
    y: 8,
    width: 60,
    height: 48,
    scaleX: 1,
    scaleY: 1,
    velocity: 0,
    highlightOffset: 0,
    leadingEdgeGlow: 0,
    direction: 'idle',
    isSettled: true,
    isReady: false,
  });

  // Internal mutable simulation state for high-frequency RAF loop
  const simRef = useRef({
    currentX: 0,
    targetX: 0,
    velocity: 0,
    width: 60,
    height: 48,
    lastTime: 0,
    rafId: 0,
    isInitial: true,
  });

  // Spring physical constants (critically damped with subtle overshoot)
  const STIFFNESS = 380;
  const DAMPING = 32;
  const MASS = 1.0;
  const MAX_STRETCH = 0.12;

  // Calculate target position from live DOM rects
  const calculateTarget = useCallback((): { x: number; width: number; height: number } | null => {
    const activeBtn = tabRefs[activeTab]?.current;
    const container = containerRef.current;

    if (!activeBtn || !container) return null;

    const btnRect = activeBtn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Fixed optimal capsule width matching tab touch footprint
    const width = Math.min(Math.max(btnRect.width - 8, 48), 68);
    const height = 48;
    const x = btnRect.left - containerRect.left + (btnRect.width - width) / 2;

    return { x, width, height };
  }, [activeTab, tabRefs, containerRef]);

  // Main spring physics update loop
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const target = calculateTarget();
    if (!target) return;

    const sim = simRef.current;
    sim.targetX = target.x;
    sim.width = target.width;
    sim.height = target.height;

    // Instant snap on initial mount or reduced motion
    if (sim.isInitial || prefersReducedMotion) {
      sim.currentX = target.x;
      sim.velocity = 0;
      sim.isInitial = false;

      setPhysicsState({
        x: target.x,
        y: 8,
        width: target.width,
        height: target.height,
        scaleX: 1,
        scaleY: 1,
        velocity: 0,
        highlightOffset: 0,
        leadingEdgeGlow: 0,
        direction: 'idle',
        isSettled: true,
        isReady: true,
      });
      return;
    }

    // Cancel any previous loop and start fresh
    if (sim.rafId) {
      cancelAnimationFrame(sim.rafId);
    }
    sim.lastTime = performance.now();

    const loop = (now: number) => {
      // Delta time capped at 32ms to prevent delta-time explosion on tab blur
      const dt = Math.min((now - sim.lastTime) / 1000, 0.032);
      sim.lastTime = now;

      // Spring-Damper Physics: F = -k*(x - target) - c*v
      const displacement = sim.currentX - sim.targetX;
      const springForce = -STIFFNESS * displacement;
      const dampingForce = -DAMPING * sim.velocity;
      const acceleration = (springForce + dampingForce) / MASS;

      sim.velocity += acceleration * dt;
      sim.currentX += sim.velocity * dt;

      // Velocity-based deformation
      const speed = Math.abs(sim.velocity);
      const deformation = Math.min(speed * 0.00065, MAX_STRETCH);
      const scaleX = 1 + deformation;
      // Optical mass conservation: scaleY inversely proportional to scaleX
      const scaleY = 1 / Math.sqrt(scaleX);

      // Specular highlight shift based on velocity direction
      const highlightOffset = Math.max(-16, Math.min(16, sim.velocity * 0.035));
      const leadingEdgeGlow = Math.min(1, speed / 650);
      const direction = sim.velocity > 10 ? 'right' : sim.velocity < -10 ? 'left' : 'idle';

      // Settling condition
      if (Math.abs(displacement) < 0.25 && speed < 1.0) {
        sim.currentX = sim.targetX;
        sim.velocity = 0;

        setPhysicsState({
          x: sim.targetX,
          y: 8,
          width: sim.width,
          height: sim.height,
          scaleX: 1,
          scaleY: 1,
          velocity: 0,
          highlightOffset: 0,
          leadingEdgeGlow: 0,
          direction: 'idle',
          isSettled: true,
          isReady: true,
        });
        return;
      }

      setPhysicsState({
        x: sim.currentX,
        y: 8,
        width: sim.width,
        height: sim.height,
        scaleX,
        scaleY,
        velocity: sim.velocity,
        highlightOffset,
        leadingEdgeGlow,
        direction,
        isSettled: false,
        isReady: true,
      });

      sim.rafId = requestAnimationFrame(loop);
    };

    sim.rafId = requestAnimationFrame(loop);

    return () => {
      if (sim.rafId) cancelAnimationFrame(sim.rafId);
    };
  }, [activeTab, calculateTarget]);

  // Responsive resize observer to maintain exact tab alignment across viewport changes
  useEffect(() => {
    const handleResize = () => {
      const target = calculateTarget();
      if (!target) return;
      simRef.current.targetX = target.x;
      simRef.current.currentX = target.x;
      simRef.current.width = target.width;
      simRef.current.height = target.height;

      setPhysicsState((prev) => ({
        ...prev,
        x: target.x,
        width: target.width,
        height: target.height,
        scaleX: 1,
        scaleY: 1,
        velocity: 0,
        isSettled: true,
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateTarget]);

  return physicsState;
}
