export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ar-EG').format(num);
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
}

export function generateUniqueId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}
