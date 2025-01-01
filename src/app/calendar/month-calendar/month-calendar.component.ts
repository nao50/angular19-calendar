import { Component, ViewChild, ElementRef, AfterViewInit, input, output, signal, effect } from '@angular/core';
import { ScheduleComponent } from '../schedule/schedule.component';
import { getCalendarWeeksCount, calculateSchedulePositions } from '../../util/calendar.util';
import { formatDate } from '../../util/date.util';
import { Schedule, MonthlyCalendarSchedulePosition } from '../../model/schedule.model';
import { isSameMonth, isToday } from 'date-fns';

@Component({
  selector: 'app-month-calendar',
  imports: [ScheduleComponent],
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

  //
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
      const dateHeight = 24; // 日付部分の高さ
      const scheduleHeight = 40; // スケジュール1件の高さ
      const moreTextHeight = 20; // 「他 X 件...」の高さ
      const scheduleGap = 0; // スケジュール間のギャップ

      const availableHeight = height - dateHeight - moreTextHeight;
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

  getVisibleSchedules(date: Date): MonthlyCalendarSchedulePosition[] {
    const positions = this.getPositionsForDay(date);
    return positions.slice(0, this.maxVisibleSchedules());
  }

  hasHiddenSchedules(date: Date): boolean {
    return this.getPositionsForDay(date).length > this.maxVisibleSchedules();
  }

  getHiddenSchedulesCount(date: Date): number {
    return this.getPositionsForDay(date).length - this.maxVisibleSchedules();
  }

  //
  get gridRowsClass(): string {
    const weeksCount = getCalendarWeeksCount(this.currentDate());
    return `grid grid-cols-7 grid-rows-${weeksCount - 1} border`;
  }

  getPositionsForDay(date: Date): MonthlyCalendarSchedulePosition[] {
    return calculateSchedulePositions(
      this.schedules() || [],
      date,
    );
  }
}
