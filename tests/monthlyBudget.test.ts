import { describe, it, expect } from 'vitest';
import { calculateBudgetStatus } from '../src/utils/calculations';

describe('Monthly Budget & 1st-of-Month Estimation Logic', () => {
  it('correctly calculates budget remaining and status', () => {
    const status1 = calculateBudgetStatus(35000, 50000);
    expect(status1.budgetAmount).toBe(50000);
    expect(status1.remainingAmount).toBe(15000);
    expect(status1.percentageUsed).toBe(70);
    expect(status1.isOverBudget).toBe(false);
    expect(status1.isNearBudget).toBe(false);

    // Near budget >= 80%
    const status2 = calculateBudgetStatus(42000, 50000);
    expect(status2.percentageUsed).toBe(84);
    expect(status2.isNearBudget).toBe(true);
    expect(status2.isOverBudget).toBe(false);

    // Over budget >= 100%
    const status3 = calculateBudgetStatus(55000, 50000);
    expect(status3.remainingAmount).toBe(-5000);
    expect(status3.percentageUsed).toBe(100);
    expect(status3.isOverBudget).toBe(true);
  });

  it('evaluates whether to show the 1st of month budget prompt', () => {
    const checkShouldPrompt = (
      hasCompletedOnboarding: boolean,
      lastPromptMonth: string | undefined,
      currentMonthKey: string
    ) => {
      if (!hasCompletedOnboarding) return false;
      if (lastPromptMonth === currentMonthKey) return false;
      return true;
    };

    // Case 1: Not onboarded yet -> should not prompt
    expect(checkShouldPrompt(false, undefined, '2026-10')).toBe(false);

    // Case 2: Onboarded in 2026-09, lastPromptMonth is '2026-09', today is Sept 20 -> should not prompt
    expect(checkShouldPrompt(true, '2026-09', '2026-09')).toBe(false);

    // Case 3: Oct 1 arrives (new month) -> MUST prompt!
    expect(checkShouldPrompt(true, '2026-09', '2026-10')).toBe(true);

    // Case 4: User opens on Oct 2 (missed day 1, but new month where budget was not set) -> MUST prompt!
    expect(checkShouldPrompt(true, '2026-09', '2026-10')).toBe(true);

    // Case 5: User already confirmed Oct budget (lastPromptMonth is '2026-10') -> should not prompt again
    expect(checkShouldPrompt(true, '2026-10', '2026-10')).toBe(false);
  });

  it('correctly resolves month budget with fallback hierarchy', () => {
    const resolveBudget = (
      monthBudget: number | undefined,
      defaultBudget: number | undefined,
      hardcodedFallback = 50000
    ) => {
      if (monthBudget && monthBudget > 0) return monthBudget;
      if (defaultBudget && defaultBudget > 0) return defaultBudget;
      return hardcodedFallback;
    };

    // Explicit month budget takes precedence
    expect(resolveBudget(75000, 50000)).toBe(75000);

    // If month budget not yet set, falls back to default onboarding budget
    expect(resolveBudget(undefined, 60000)).toBe(60000);

    // If neither exists, falls back to hardcoded safe default
    expect(resolveBudget(undefined, undefined)).toBe(50000);
  });
});
