const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function getTodayDateString(): string {
  const now = new Date();
  return formatDateToString(now);
}

export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDateToString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateString(dateStr: string): Date {
  // Safe parsing of YYYY-MM-DD without UTC timezone drift
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

/**
 * Returns the number of days in a given month (1 to 12).
 * Correctly accounts for leap years.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getMonthName(month: number, short: boolean = false): string {
  const index = Math.max(0, Math.min(11, month - 1));
  return short ? MONTH_NAMES_SHORT[index] : MONTH_NAMES[index];
}

export function formatTime12H(timeStr?: string): string {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr ? minutesStr.padStart(2, '0') : '00';
  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Returns date header for groupings:
 * 'TODAY', 'YESTERDAY', or 'MONDAY, 15 SEP' / '15 SEP 2025'
 */
export function getDateGroupHeader(dateStr: string): string {
  const todayStr = getTodayDateString();
  if (dateStr === todayStr) {
    return 'TODAY';
  }

  const today = parseDateString(todayStr);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateToString(yesterday);

  if (dateStr === yesterdayStr) {
    return 'YESTERDAY';
  }

  const date = parseDateString(dateStr);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dayNum = date.getDate();
  const monthShort = getMonthName(date.getMonth() + 1, true).toUpperCase();
  const isCurrentYear = date.getFullYear() === today.getFullYear();

  if (isCurrentYear) {
    return `${dayName}, ${dayNum} ${monthShort}`;
  }
  return `${dayNum} ${monthShort} ${date.getFullYear()}`;
}

export function formatRelativeDateTime(dateStr: string, timeStr?: string): string {
  const header = getDateGroupHeader(dateStr);
  let datePart = '';
  if (header === 'TODAY') datePart = 'Today';
  else if (header === 'YESTERDAY') datePart = 'Yesterday';
  else {
    const d = parseDateString(dateStr);
    datePart = `${d.getDate()} ${getMonthName(d.getMonth() + 1, true)}`;
  }

  if (timeStr) {
    return `${datePart} · ${formatTime12H(timeStr)}`;
  }
  return datePart;
}
