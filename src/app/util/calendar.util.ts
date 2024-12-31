import { Schedule, MonthlyCalendarSchedulePosition } from '../model/schedule.model'; 
import {
  startOfWeek,
  endOfWeek,
  endOfMonth,
  startOfMonth,
  isSameDay,
  isWithinInterval,
  differenceInDays,
} from 'date-fns';

export const getCalendarWeeksCount = (date: Date): number => {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
  return Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
}

// export const calculateSchedulePositions = (
//   schedules: Schedule[],
//   startDate: Date,
//   days: number
// ): MonthlyCalendarSchedulePosition[] => {
//   const positions: MonthlyCalendarSchedulePosition[] = [];
//   const columns = new Array(days).fill(0);

//   for (const schedule of schedules) {
//     const start = new Date(schedule.startDate);
//     const end = new Date(schedule.endDate);
    
//     const startIndex = Math.max(0, differenceInDays(start, startDate));
//     const endIndex = Math.min(days - 1, differenceInDays(end, startDate));
//     const rowSpan = endIndex - startIndex + 1;

//     let column = 0;
//     while (columns[startIndex + column] > 0) {
//       column++;
//     }

//     for (let i = startIndex; i <= endIndex; i++) {
//       columns[i] = Math.max(columns[i], column + 1);
//     }

//     positions.push({
//       schedule,
//       column,
//       columnSpan: 1,
//       row: startIndex,
//       rowSpan
//     });
//   }
//   return positions;
// }


// export const calculateSchedulePositions = (
//   schedules: Schedule[],
//   currentDate: Date,
// ): MonthlyCalendarSchedulePosition[] => {
//   const positions: MonthlyCalendarSchedulePosition[] = [];

//   const relevantSchedules = schedules.filter(schedule => {
//     const start = new Date(schedule.startDate);
//     const end = new Date(schedule.endDate);
//     return isWithinInterval(currentDate, { start, end }) || 
//            isSameDay(currentDate, start) || 
//            isSameDay(currentDate, end);
//   });

//   for (const schedule of relevantSchedules) {
//     const start = new Date(schedule.startDate);
//     const end = new Date(schedule.endDate);
    
//     if (isSameDay(currentDate, start)) {
//       positions.push({
//         schedule,
//         column: 0,
//         columnSpan: 1,
//         row: 0,
//         rowSpan: 1
//       });
//     }
//   }
//   return positions;
// }

export const calculateSchedulePositions = (
  schedules: Schedule[],
  currentDate: Date,
): MonthlyCalendarSchedulePosition[] => {
  return schedules
    .filter(schedule => {
      const start = new Date(schedule.startDate);
      const end = new Date(schedule.endDate);
      return isWithinInterval(currentDate, { start, end }) || 
             isSameDay(currentDate, start) || 
             isSameDay(currentDate, end);
    })
    .map(schedule => ({
      schedule,
      column: 0,
      columnSpan: 1,
      row: 0,
      rowSpan: 1
    }));
}

export const getEventsForDay = (date: Date, events: Schedule[]): Schedule[] => {
  return events.filter(event => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return isWithinInterval(date, { start, end }) || 
           isSameDay(date, start) || 
           isSameDay(date, end);
  });
}