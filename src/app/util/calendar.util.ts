import { Schedule, MonthlyCalendarSchedulePosition, MonthlyCalendarSchedulePosition2 } from '../model/schedule.model'; 
import {
  startOfWeek,
  endOfWeek,
  endOfMonth,
  startOfMonth,
  isSameDay,
  isWithinInterval,
  differenceInDays,
  eachDayOfInterval,
  differenceInMinutes,
  startOfDay,
  endOfDay,
} from 'date-fns';

export const getWeekDays = (date: Date): Date[] => {
  return eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end: endOfWeek(date, { weekStartsOn: 0 })
  });
}

export const getCalendarWeeksCount = (date: Date): number => {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
  return Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
}

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

export const calculateSchedulePositionsForMonthlyCalender = (
  schedules: Schedule[],
  weekStart: Date,
): MonthlyCalendarSchedulePosition2[] => {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
  // この週に表示すべきスケジュールをフィルタリング
  const weeklySchedules = schedules.filter(schedule => {
    const start = new Date(schedule.startDate);
    const end = new Date(schedule.endDate);
    return isWithinInterval(weekStart, { start, end }) ||
           isWithinInterval(weekEnd, { start, end }) ||
           isWithinInterval(start, { start: weekStart, end: weekEnd });
  });

  // // 各スケジュールの週内での位置を計算
  // const positions: MonthlyCalendarSchedulePosition2[] = weeklySchedules.map(schedule => {
  //   const start = new Date(schedule.startDate);
  //   const end = new Date(schedule.endDate);
    
  //   // 週の開始位置を計算（週の始めより前なら0）
  //   const startOffset = start < weekStart 
  //     ? 0 
  //     : differenceInDays(start, weekStart);
    
  //   // 週内での表示日数を計算
  //   const duration = end > weekEnd
  //     ? 7 - startOffset  // 週末まで
  //     : differenceInDays(end, start) + 1;

  //   return {
  //     schedule,
  //     startOffset,
  //     duration,
  //     row: 0  // 後で重なり計算で更新
  //   };
  // });
  const positions: MonthlyCalendarSchedulePosition2[] = weeklySchedules.map(schedule => {
    const start = new Date(schedule.startDate);
    const end = new Date(schedule.endDate);
    
    // 実効開始日を計算（週の始めより前なら週の始め）
    const effectiveStart = start < weekStart ? weekStart : start;
    // 実効終了日を計算（週の終わりより後なら週の終わり）
    const effectiveEnd = end > weekEnd ? weekEnd : end;
    
    const startOffset = differenceInDays(effectiveStart, weekStart);
    const duration = differenceInDays(effectiveEnd, effectiveStart) + 1;

    return {
      schedule,
      startOffset,
      duration,
      row: 0
    };
  });

  // 重なりを解決して行位置を割り当て
  return assignRows(positions);
}

function assignRows(positions: MonthlyCalendarSchedulePosition2[]): MonthlyCalendarSchedulePosition2[] {
  // 開始日が早い順、長い順にソート
  positions.sort((a, b) => {
    if (a.startOffset !== b.startOffset) {
      return a.startOffset - b.startOffset;
    }
    return b.duration - a.duration;
  });

  const rowUsage: boolean[][] = Array(10).fill(null).map(() => Array(7).fill(false));

  return positions.map(pos => {
    let row = 0;
    while (true) {
      let canUseRow = true;
      for (let i = pos.startOffset; i < pos.startOffset + pos.duration; i++) {
        if (rowUsage[row][i]) {
          canUseRow = false;
          break;
        }
      }
      if (canUseRow) {
        for (let i = pos.startOffset; i < pos.startOffset + pos.duration; i++) {
          rowUsage[row][i] = true;
        }
        return { ...pos, row };
      }
      row++;
    }
  });
}
// export const calculateSchedulePositions = (
//   schedules: Schedule[],
//   currentDate: Date,
// ): MonthlyCalendarSchedulePosition[] => {
//   const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
//   const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  
//   const relevantSchedules = schedules.filter(schedule => {
//     const start = startOfDay(new Date(schedule.startDate));
//     const end = endOfDay(new Date(schedule.endDate));
//     return isWithinInterval(currentDate, { start, end });
//   });

//   console.log('relevantSchedules', relevantSchedules);

//   // 同じ週内でのスケジュールの開始日と終了日を計算
//   const positions = relevantSchedules.map(schedule => {
//     const start = new Date(schedule.startDate);
//     const end = new Date(schedule.endDate);
    
//     // 週の開始日と終了日に制限
//     const effectiveStart = start < weekStart ? weekStart : start;
//     const effectiveEnd = end > weekEnd ? weekEnd : end;
    
//     // 列の位置とスパンを計算
//     const column = effectiveStart.getDay();
//     const columnSpan = Math.min(
//       7 - column, // 週末までの残り日数
//       differenceInDays(effectiveEnd, effectiveStart) + 1 // 実際の日数
//     );

//     return {
//       schedule,
//       column,
//       columnSpan,
//       row: 0,
//       rowSpan: 1
//     };
//   });

//   console.log('positions', positions)

//   // 行の位置を割り当て（重なりを避けるため）
//   positions.sort((a, b) => {
//     // 長いスケジュールを優先
//     if (a.columnSpan !== b.columnSpan) {
//       return b.columnSpan - a.columnSpan;
//     }
//     // 開始時刻が早いものを優先
//     return a.schedule.startDate.getTime() - b.schedule.startDate.getTime();
//   });

//   // 各行の使用状況を追跡
//   const rowUsage: boolean[][] = Array(10).fill(null).map(() => Array(7).fill(false));

//   positions.forEach(pos => {
//     let row = 0;
//     // スケジュールを配置できる最初の行を探す
//     while (true) {
//       let canPlaceAtRow = true;
//       for (let col = pos.column; col < pos.column + pos.columnSpan; col++) {
//         if (rowUsage[row][col]) {
//           canPlaceAtRow = false;
//           break;
//         }
//       }
//       if (canPlaceAtRow) {
//         // この行にスケジュールを配置
//         for (let col = pos.column; col < pos.column + pos.columnSpan; col++) {
//           rowUsage[row][col] = true;
//         }
//         pos.row = row;
//         break;
//       }
//       row++;
//     }
//   });

//   return positions;
// }

// export const calculateSchedulePositions = (
//   schedules: Schedule[],
//   weekStart: Date,
// ): MonthlyCalendarSchedulePosition[] => {
//   const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
  
//   const relevantSchedules = schedules.filter(schedule => {
//     const start = startOfDay(new Date(schedule.startDate));
//     const end = endOfDay(new Date(schedule.endDate));
//     return isWithinInterval(weekStart, { start, end }) ||
//            isWithinInterval(weekEnd, { start, end }) ||
//            isWithinInterval(start, { start: weekStart, end: weekEnd });
//   });

//   // 同じ週内でのスケジュールの開始日と終了日を計算
//   const positions = relevantSchedules.map(schedule => {
//     const start = new Date(schedule.startDate);
//     const end = new Date(schedule.endDate);
    
//     // 週の開始日と終了日に制限
//     const effectiveStart = start < weekStart ? weekStart : start;
//     const effectiveEnd = end > weekEnd ? weekEnd : end;
    
//     // 列の位置とスパンを計算
//     const column = effectiveStart.getDay();
//     const columnSpan = Math.min(
//       7 - column, // 週末までの残り日数
//       differenceInDays(effectiveEnd, effectiveStart) + 1 // 実際の日数
//     );

//     return {
//       schedule,
//       column,
//       columnSpan,
//       row: 0,
//       rowSpan: 1
//     };
//   });

//   // 行の位置を割り当て（重なりを避けるため）
//   positions.sort((a, b) => {
//     // 長いスケジュールを優先
//     if (a.columnSpan !== b.columnSpan) {
//       return b.columnSpan - a.columnSpan;
//     }
//     // 開始時刻が早いものを優先
//     return differenceInMinutes(
//       a.schedule.startDate,
//       b.schedule.startDate
//     );
//   });

//   // 各行の使用状況を追跡
//   const rowUsage: boolean[][] = Array(10).fill(null).map(() => Array(7).fill(false));

//   positions.forEach(pos => {
//     let row = 0;
//     // スケジュールを配置できる最初の行を探す
//     while (true) {
//       let canPlaceAtRow = true;
//       for (let col = pos.column; col < pos.column + pos.columnSpan; col++) {
//         if (rowUsage[row][col]) {
//           canPlaceAtRow = false;
//           break;
//         }
//       }
//       if (canPlaceAtRow) {
//         // この行にスケジュールを配置
//         for (let col = pos.column; col < pos.column + pos.columnSpan; col++) {
//           rowUsage[row][col] = true;
//         }
//         pos.row = row;
//         break;
//       }
//       row++;
//     }
//   });

//   return positions;
// }

export const getEventsForDay = (date: Date, events: Schedule[]): Schedule[] => {
  return events.filter(event => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return isWithinInterval(date, { start, end }) || 
           isSameDay(date, start) || 
           isSameDay(date, end);
  });
}

export const calculateSchedulePositionsForWeeklyCalender
  = (event: Schedule, hourHeight: number = 56): { 
    top: string;
    height: string;
  } => {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  
  const minutesFromStartOfDay = start.getHours() * 60 + start.getMinutes();
  const duration = differenceInMinutes(end, start);
  
  const top = (minutesFromStartOfDay / 60) * hourHeight;
  const height = (duration / 60) * hourHeight;
  
  return {
    top: `${top}px`,
    height: `${height}px`
  };
}