import { describe, it, expect } from 'vitest';

describe('Liquid Glass Physics & Deformation Formulas', () => {
  const MAX_STRETCH = 0.12;

  function calculateDeformation(velocity: number) {
    const speed = Math.abs(velocity);
    const deformation = Math.min(speed * 0.00065, MAX_STRETCH);
    const scaleX = 1 + deformation;
    const scaleY = 1 / Math.sqrt(scaleX);
    const highlightOffset = Math.max(-16, Math.min(16, velocity * 0.035));
    const leadingEdgeGlow = Math.min(1, speed / 650);

    return { scaleX, scaleY, highlightOffset, leadingEdgeGlow };
  }

  it('calculates rest state at zero velocity', () => {
    const rest = calculateDeformation(0);
    expect(rest.scaleX).toBe(1.0);
    expect(rest.scaleY).toBe(1.0);
    expect(rest.highlightOffset).toBe(0);
    expect(rest.leadingEdgeGlow).toBe(0);
  });

  it('calculates dynamic elongation and optical mass conservation during fast motion', () => {
    const movingRight = calculateDeformation(300); // 300 px/s
    expect(movingRight.scaleX).toBeGreaterThan(1.0);
    expect(movingRight.scaleX).toBeLessThanOrEqual(1 + MAX_STRETCH);
    // Optical mass conservation: scaleY < 1 when scaleX > 1
    expect(movingRight.scaleY).toBeLessThan(1.0);
    expect(movingRight.highlightOffset).toBeGreaterThan(0);
    expect(movingRight.leadingEdgeGlow).toBeGreaterThan(0);
  });

  it('clamps deformation stretch factor to maximum ceiling at extreme velocities', () => {
    const extremeSpeed = calculateDeformation(2000);
    expect(extremeSpeed.scaleX).toBe(1 + MAX_STRETCH);
    expect(extremeSpeed.highlightOffset).toBe(16);
    expect(extremeSpeed.leadingEdgeGlow).toBe(1);
  });

  it('reverses highlight offset when moving left', () => {
    const movingLeft = calculateDeformation(-400);
    expect(movingLeft.highlightOffset).toBeLessThan(0);
    expect(movingLeft.scaleX).toBeGreaterThan(1.0);
    expect(movingLeft.leadingEdgeGlow).toBeGreaterThan(0);
  });
});
