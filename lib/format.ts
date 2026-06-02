export function formatMoney(
  amountMinor: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string {
  const major = amountMinor / 100;
  if (currency === 'INR') {
    return `₹${major.toLocaleString(locale, {
      maximumFractionDigits: 0
    })}`;
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(major);
  } catch {
    return `${currency} ${major.toLocaleString(locale)}`;
  }
}

export function formatRelative(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const future = diffMs < 0;
  const abs = Math.abs(diffMs);
  const min = Math.round(abs / (1000 * 60));
  const hour = Math.round(abs / (1000 * 60 * 60));
  const day = Math.round(abs / (1000 * 60 * 60 * 24));

  if (min < 1) return future ? 'in a moment' : 'just now';
  if (min < 60) return future ? `in ${min}m` : `${min}m ago`;
  if (hour < 24) return future ? `in ${hour}h` : `${hour}h ago`;
  if (day === 0) return future ? 'today' : 'today';
  if (day === 1) return future ? 'tomorrow' : 'yesterday';
  if (day < 7) return future ? `in ${day} days` : `${day}d ago`;
  return date.toLocaleDateString();
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  const last4 = digits.slice(-4);
  return `••••• ${last4}`;
}
