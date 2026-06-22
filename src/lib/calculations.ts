export function safeNumber(value: unknown, fallback = 0): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : fallback;

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function safeDivide(numerator: unknown, denominator: unknown, fallback = 0): number {
  const num = safeNumber(numerator, fallback);
  const den = safeNumber(denominator, 0);

  if (den === 0) return fallback;

  const result = num / den;
  return Number.isFinite(result) ? result : fallback;
}

export function safePercentage(numerator: unknown, denominator: unknown, fallback = 0): number {
  const value = Math.round(safeDivide(numerator, denominator, fallback) * 100);
  if (!Number.isFinite(value)) return fallback;
  return clamp(value, 0, 100);
}

export function safeAverage(values: unknown[], fallback = 0): number {
  const numericValues = values.map((value) => safeNumber(value, NaN)).filter((value) => Number.isFinite(value));
  if (numericValues.length === 0) return fallback;

  const total = numericValues.reduce((acc, value) => acc + value, 0);
  const average = total / numericValues.length;
  return Number.isFinite(average) ? average : fallback;
}

export function safeSum(values: unknown[], fallback = 0): number {
  const total = values.reduce((acc, value) => acc + safeNumber(value, 0), 0);
  return Number.isFinite(total) ? total : fallback;
}

export function safeCurrency(value: unknown, locale = 'en-US', currency = 'USD'): string {
  const amount = safeNumber(value, 0);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

