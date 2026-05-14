export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}

export function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isOverdue(dueDate: string | null | undefined, isCompleted: boolean): boolean {
  if (!dueDate || isCompleted) return false;
  return dueDate.slice(0, 10) < getToday();
}

export function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return '';
  if (!endDate) return `${startDate} ~`;
  if (!startDate) return `~ ${endDate}`;
  return `${startDate} ~ ${endDate}`;
}

export function localDateStr(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function hasTime(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d.getHours() !== 0 || d.getMinutes() !== 0;
}

export function formatDateTimeDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  if (!hasTime(dateStr)) return `${year}. ${month}. ${day}.`;
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h < 12 ? '오전' : '오후';
  const hour12 = h % 12 || 12;
  return `${year}. ${month}. ${day}. ${ampm} ${hour12}:${m}`;
}

export function formatTimeShort(dateStr: string | null | undefined): string {
  if (!dateStr || !hasTime(dateStr)) return '';
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h < 12 ? '오전' : '오후';
  const hour12 = h % 12 || 12;
  return `${ampm} ${hour12}:${m}`;
}
