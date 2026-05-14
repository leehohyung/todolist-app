export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}

export function getToday(): string {
  return new Date().toISOString().slice(0, 10);
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
