import dayjs from 'dayjs';

export const formatMoney = (amount: any): string => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatNumber = (num: any, decimals = 2): string => {
  const n = typeof num === 'number' ? num : parseFloat(num) || 0;
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatDate = (date: any): string => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
};

export const formatDateTime = (date: any): string => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

export const formatTime = (date: any): string => {
  if (!date) return '';
  return dayjs(date).format('HH:mm');
};

export const formatRelativeTime = (date: any): string => {
  if (!date) return '';
  const d = dayjs(date);
  const now = dayjs();
  const diff = now.diff(d, 'minute');

  if (diff < 1) return '刚刚';
  if (diff < 60) return `${diff}分钟前`;
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}天前`;
  return d.format('YYYY-MM-DD');
};

export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};
