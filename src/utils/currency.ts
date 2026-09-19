import { SUPPORTED_CURRENCIES, type CurrencyConfig } from '../types';

export function getCurrencyConfig(code: string = 'LKR'): CurrencyConfig {
  return SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES.LKR;
}

export function formatCurrency(
  amount: number,
  currencyCode: string = 'LKR',
  options: { showNegativeSign?: boolean; showCents?: boolean } = {}
): string {
  if (isNaN(amount) || !isFinite(amount)) {
    amount = 0;
  }

  const { showNegativeSign = false, showCents = true } = options;
  const config = getCurrencyConfig(currencyCode);

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const parts = absAmount.toFixed(showCents ? config.decimalDigits : 0).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = showCents && parts[1] ? `.${parts[1]}` : '';
  const formattedNumber = `${integerPart}${decimalPart}`;

  let result = '';
  if (config.position === 'prefix') {
    result = `${config.symbol} ${formattedNumber}`;
  } else {
    result = `${formattedNumber} ${config.symbol}`;
  }

  if (isNegative || showNegativeSign) {
    return `-${result}`;
  }

  return result;
}

export function parseAmountInput(input: string): number {
  if (!input) return 0;
  // Match digits with optional commas and decimal point
  const match = input.match(/(\d[\d,]*(\.\d+)?)/);
  if (!match) return 0;
  const numStr = match[1].replace(/,/g, '');
  const parsed = parseFloat(numStr);
  if (isNaN(parsed) || !isFinite(parsed)) {
    return 0;
  }
  return Math.round(parsed * 100) / 100;
}
