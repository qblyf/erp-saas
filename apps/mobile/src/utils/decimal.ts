// Decimal conversion utilities for Prisma Decimal types

export const toNumber = (v: any): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v);
  return parseFloat(v.toString());
};

export const toDecimalString = (v: any): string => {
  if (v === null || v === undefined) return '0';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return v.toString();
  return v.toString();
};

export const addDecimals = (...values: any[]): number => {
  return values.reduce((sum, v) => sum + toNumber(v), 0);
};

export const multiplyDecimal = (a: any, b: any): number => {
  return toNumber(a) * toNumber(b);
};
