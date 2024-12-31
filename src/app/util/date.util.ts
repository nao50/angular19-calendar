import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';

export const formatDate = (date: Date, formatStr: string): string => {
  return format(date, formatStr, { locale: ja });
};

export const generateCalendarDays = (currentDate: Date): Date[] => {
  const start = startOfWeek(startOfMonth(currentDate));
  const end = endOfWeek(endOfMonth(currentDate));
  return eachDayOfInterval({ start, end });
};

// export function getClickedDateTime(event: MouseEvent, date: Date): Date {
//   const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
//   const y = event.clientY - rect.top;
//   const height = rect.height;
  
//   // 1時間を4分割（15分単位）
//   const quarterHour = Math.floor((y / height) * 4);
//   const minutes = quarterHour * 15;
  
//   const result = new Date(date);
//   const hourElement = event.currentTarget as HTMLElement;
//   const hourIndex = Array.from(hourElement.parentElement?.children || []).indexOf(hourElement);
  
//   // ヘッダ分を除く
//   result.setHours(hourIndex - 1 , minutes, 0, 0);
//   return result;
// }

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}
