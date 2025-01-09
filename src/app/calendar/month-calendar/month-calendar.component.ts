import { Component, ViewChild, ElementRef, AfterViewInit, input, output, signal, effect } from '@angular/core';
import { ScheduleComponent } from '../schedule/schedule.component';
import { getCalendarWeeksCount, calculateSchedulePositionsForMonthlyCalender } from '../../util/calendar.util';
import { formatDate } from '../../util/date.util';
import { Schedule, MonthlyCalendarSchedulePosition } from '../../model/schedule.model';
import { addDays, differenceInDays, endOfWeek, isSameDay, isSameMonth, isToday, isWithinInterval, startOfDay, startOfWeek } from 'date-fns';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-month-calendar',
  imports: [CommonModule, ScheduleComponent],
  templateUrl: './month-calendar.component.html',
  styleUrl: './month-calendar.component.css'
})
export class MonthCalendarComponent implements AfterViewInit {
  dayOfWeeks = ['日', '月', '火', '水', '木', '金', '土'];
  currentDate = input.required<Date>();
  daysDisplayedWithinMonth = input<Date[]>([]);
  schedules = input<Schedule[]>();
  createSchedule = output<Date>();
  editSchedule = output<Schedule>();

  @ViewChild('calendarGrid') calendarGrid!: ElementRef;
  private cellHeight = signal(0);
  private maxVisibleSchedules = signal(0);

  formatDate = formatDate;
  isSameMonth = isSameMonth;
  isToday = isToday;

  constructor() {
    // cellHeightが変更されたら自動的にmaxVisibleSchedulesを再計算
    effect(() => {
      const height = this.cellHeight();
      // const dateHeight = 24; // 日付部分の高さ
      // const scheduleHeight = 40; // スケジュール1件の高さ
      // const moreTextHeight = 20; // 「他 X 件...」の高さ
      // const scheduleGap = 0; // スケジュール間のギャップ
      // const availableHeight = height - dateHeight - moreTextHeight;
      // const scheduleWithGapHeight = scheduleHeight + scheduleGap;
      const dateHeight = 24; // 日付部分の高さ
      const scheduleHeight = 28; // スケジュール1件の高さ
      const moreTextHeight = 20; // 「他 X 件...」の高さ
      const padding = 8; // 上下のパディング
      const scheduleGap = 4; // スケジュール間のギャップ

      const availableHeight = height - dateHeight - moreTextHeight - (padding * 2);
      const scheduleWithGapHeight = scheduleHeight + scheduleGap;

      
      this.maxVisibleSchedules.set(Math.max(1, Math.floor(availableHeight / scheduleWithGapHeight)));
    });
  }

  ngAfterViewInit() {
    this.updateCellHeight();
    this.setupResizeObserver();
  }

  private updateCellHeight() {
    const gridCells = this.calendarGrid.nativeElement.children;
    if (gridCells.length > 0) {
      this.cellHeight.set(gridCells[0].clientHeight);
    }
  }

  private setupResizeObserver() {
    const resizeObserver = new ResizeObserver(() => {
      this.updateCellHeight();
    });
    resizeObserver.observe(this.calendarGrid.nativeElement);
  }

  get gridRowsClass(): string {
    const weeksCount = getCalendarWeeksCount(this.currentDate());
    return `grid grid-cols-7 grid-rows-${weeksCount - 1} border`;
  }

  getGridScheduleClass(schedule: Schedule, day: Date): string {
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    const dayOfWeek = day.getDay();
    const daysUntilWeekEnd = 6 - dayOfWeek;
    const weekIndex = Math.floor(this.daysDisplayedWithinMonth().findIndex(d => d === day) / 7);

    // 同じ週内で終わる場合
    if (endDate <= addDays(day, daysUntilWeekEnd)) {
      const daysSpan = differenceInDays(endDate, startDate) + 1;
      // return `calc(${Math.min(daysSpan, daysUntilWeekEnd + 1) * 100}% + ${Math.min(daysSpan, daysUntilWeekEnd + 1) - 1}rem)` 
      return `calc(${Math.min(daysSpan, daysUntilWeekEnd + 1) * 100}% + ${Math.min(daysSpan, daysUntilWeekEnd + 1) * 0.25}rem)`
    }

    // 週を跨ぐ場合、現在の週の残りの日数分だけ表示
    return `calc(${(daysUntilWeekEnd + 1) * 100}% + ${daysUntilWeekEnd}rem)`
}

  // gridScheduleClass(schedule: Schedule, day: Date): string {
  //   const startDate = new Date(schedule.startDate);
  //   const endDate = new Date(schedule.endDate);
  //   const dayOfWeek = day.getDay();
  //   const daysUntilWeekEnd = 6 - dayOfWeek;
  //   const weekIndex = Math.floor(this.daysDisplayedWithinMonth().findIndex(d => d === day) / 7);

  //   // 同じ週内で終わる場合
  // if (endDate <= addDays(day, daysUntilWeekEnd)) {
  //   const daysSpan = differenceInDays(endDate, startDate) + 1;
  //   // return {
  //   //   width: `calc(${Math.min(daysSpan, daysUntilWeekEnd + 1) * 100}% + ${Math.min(daysSpan, daysUntilWeekEnd + 1) - 1}rem)`,
  //   //   top: '2em',
  //   //   left: '0',
  //   //   weekIndex
  //   // };
  //   // return `absolute block w-[calc(${Math.min(daysSpan, daysUntilWeekEnd + 1) * 100}%_+_${Math.min(daysSpan, daysUntilWeekEnd + 1)}rem)] top-[2em] min-h-[1.75rem] sm:min-h-[2rem] lg:min-h-[2.5rem]`
  //   // return `absolute block w-[${w2}%] top-[2em] min-h-[1.75rem] sm:min-h-[2rem] lg:min-h-[2.5rem]`
  //   return `absolute block top-[2em] min-h-[1.75rem] sm:min-h-[2rem] lg:min-h-[2.5rem]`
  // }
  
  // // 週を跨ぐ場合、現在の週の残りの日数分だけ表示
  // // return {
  // //   width: `calc(${(daysUntilWeekEnd + 1) * 100}% + ${daysUntilWeekEnd}rem)`,
  // //   top: '2em',
  // //   left: '0',
  // //   weekIndex
  // // };
  // return `absolute block w-[calc(${(daysUntilWeekEnd + 1) * 100}%_+_${daysUntilWeekEnd}rem)] top-[2em] min-h-[1.75rem] sm:min-h-[2rem] lg:min-h-[2.5rem]`
  
  //   // return `absolute block w-[calc(300%_+_1rem)] top-[2em] min-h-[1.75rem] sm:min-h-[2rem] lg:min-h-[2.5rem]`
  // }

  // getVisibleSchedules(day: Date): Schedule[] {
  //   const schedules = (this.schedules() || []).filter(schedule => {
  //     const startDate = new Date(schedule.startDate);
  //     const endDate = new Date(schedule.endDate);
  //     const weekStart = startOfWeek(day);
  //     const weekEnd = endOfWeek(day);      
  //     return (
  //       (startDate <= day && endDate >= day) || // 現在の日にちを含む
  //       (startDate >= weekStart && startDate <= weekEnd) // この週に開始
  //     );
  //   });
  //   return schedules.slice(0, this.maxVisibleSchedules());
  // }

  // getVisibleSchedules(date: Date): MonthlyCalendarSchedulePosition[] {
  //   const positions = this.getPositionsForDay(date);
  //   return positions.slice(0, this.maxVisibleSchedules());
  // }

  getVisibleSchedules(date: Date): MonthlyCalendarSchedulePosition[] {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    const positions = calculateSchedulePositionsForMonthlyCalender(this.schedules() || [], weekStart, this.maxVisibleSchedules());
    const visibleSchedules = positions
      .filter(pos => {
        const scheduleStart = startOfDay(new Date(pos.schedule.startDate));
        const scheduleEnd = startOfDay(new Date(pos.schedule.endDate));

        if (pos.row >= this.maxVisibleSchedules()) {
          return false;
        }

        // 1. その日が開始日の場合は表示
        if (isSameDay(scheduleStart, date)) {
          return true;
        }
        // 2. 週の最初の日で、かつスケジュールが前の週から継続している場合は表示
        if (date.getDay() === 0 && scheduleStart < date && scheduleEnd >= date) {
          return true;
        }
        return false;
      })
      // .slice(0, this.maxVisibleSchedules());

      return visibleSchedules
  }
  getScheduleStyle(position: MonthlyCalendarSchedulePosition): { [key: string]: string } {
    console.log('position.duration:', position.duration)
    const paddingOffset = (position.duration - 1) * 2 * 0.25;
    const borderOffset = (position.duration - 1) * 2 * 1;

    return {
      position: 'absolute',
      left: '0',
      // width: `calc(${position.duration * 100}% + ${position.duration - 1}rem)`,
      width: `calc(${position.duration * 100}% + ${paddingOffset}rem + ${borderOffset}px)`,
      // top: `${(position.row * 2 + 1.75)}rem`,
      // top: `${(position.row * 1.75)}rem`,
      top: `${(position.row * 2)}rem`,
      // transform: `translateX(calc(${position.startOffset * 100}% + ${position.startOffset}rem))`
    };
  }
  //
  getHiddenSchedulesCount(date: Date): number {
    const targetDate = startOfDay(date);
    return (this.schedules() || [])
      .filter(schedule => {
        const scheduleStart = startOfDay(new Date(schedule.startDate));
        const scheduleEnd = startOfDay(new Date(schedule.endDate));
        
        // その日が開始日と終了日の間に含まれているかチェック
        return isWithinInterval(targetDate, { start: scheduleStart, end: scheduleEnd });
      })
      .length - this.maxVisibleSchedules();
  }

  // hasHiddenSchedules(date: Date): boolean {
  //   return this.getPositionsForDay(date).length > this.maxVisibleSchedules();
  // }

  // getHiddenSchedulesCount(date: Date): number {
  //   return this.getPositionsForDay(date).length - this.maxVisibleSchedules();
  // }

  // private getPositionsForDay(date: Date): MonthlyCalendarSchedulePosition[] {
  //   const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  //   const positions = this.getSchedulePositionsForWeek(weekStart);
    
  //   return positions.filter(pos => {
  //     const dayOffset = differenceInDays(date, weekStart);
  //     return dayOffset >= pos.startOffset && 
  //            dayOffset < (pos.startOffset + pos.duration);
  //   });
  // }

  // getPositionsForDay(date: Date): MonthlyCalendarSchedulePosition[] {
  //   return calculateSchedulePositions(
  //     this.schedules() || [],
  //     date,
  //   );
  // }

  /////////////////////////////////////////////////////////////////////////////////////////////
  // getWeeks(): Date[] {
  //   const days = this.daysDisplayedWithinMonth();
  //   const weeks: Date[] = [];
  //   for (let i = 0; i < days.length; i += 7) {
  //     weeks.push(days[i]);
  //   }
  //   return weeks;
  // }

  // getSchedulePositionsForWeek(weekStart: Date): MonthlyCalendarSchedulePosition[] {
  //   return calculateSchedulePositionsForMonthlyCalender(this.schedules() || [], weekStart);
  // }

  // getVisibleSchedulePositionsForWeek(weekStart: Date): MonthlyCalendarSchedulePosition[] {
  //   const positions = this.getSchedulePositionsForWeek(weekStart);
  //   // console.log('positions:', positions)
  //   return positions.slice(0, this.maxVisibleSchedules());
  // }

  // hasHiddenSchedules(date: Date): boolean {
  //   const weekStart = startOfWeek(date);
  //   const positions = this.getSchedulePositionsForWeek(weekStart);
  //   const visibleCount = this.maxVisibleSchedules();
  //   return positions.some(pos => 
  //     pos.row >= visibleCount && 
  //     pos.column <= date.getDay() && 
  //     pos.column + pos.columnSpan > date.getDay()
  //   );
  // }

  // getHiddenSchedulesCount(date: Date): number {
  //   const weekStart = startOfWeek(date);
  //   const positions = this.getSchedulePositionsForWeek(weekStart);
  //   const visibleCount = this.maxVisibleSchedules();
  //   return positions.filter(pos => 
  //     pos.row >= visibleCount && 
  //     pos.column <= date.getDay() && 
  //     pos.column + pos.columnSpan > date.getDay()
  //   ).length;
  // }

  // getScheduleGridRow(weekStart: Date, position: MonthlyCalendarSchedulePosition): string {
  //   const weekIndex = Math.floor(
  //     this.daysDisplayedWithinMonth().findIndex(day => day === weekStart) / 7
  //   ) + 1;
  //   return `${weekIndex}`;
  // }

  // getScheduleGridColumn(position: MonthlyCalendarSchedulePosition): string {
  //   return `${position.column + 1} / span ${position.columnSpan}`;
  // }

  // getScheduleTop(position: MonthlyCalendarSchedulePosition): string {
  //   return `${position.row * 2 + 1.75}rem`;
  // }
}
