/**
 * 安全地将任何数值类型转换为数字
 * 处理 Prisma Decimal、字符串、null、undefined 等情况
 */
export function toNumber(value: unknown, defaultValue = 0): number {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  // Prisma Decimal 或其他对象
  if (typeof value === 'object') {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }
  return defaultValue;
}

/**
 * 格式化金额显示
 */
export function formatMoney(value: unknown): string {
  return `¥${toNumber(value).toFixed(2)}`;
}

/**
 * 格式化数量
 */
export function formatQuantity(value: unknown): string {
  return toNumber(value).toString();
}
