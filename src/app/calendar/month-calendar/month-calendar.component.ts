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
  // ドラッグ中のスケジュール
  draggingSchedule = signal<Schedule | null>(null);
  // ドラッグ中のスケジュールのドロップ先の日付
  dropTargetDate = signal<Date | null>(null);
  // スケジュールの更新イベント
  updateSchedule = output<Schedule>();

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

  getVisibleSchedules(date: Date): MonthlyCalendarSchedulePosition[] {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    let positions = calculateSchedulePositionsForMonthlyCalender(this.schedules() || [], weekStart, this.maxVisibleSchedules());
    //
    // ドラッグ中かつドロップ候補の日付の場合、既存のスケジュールを1段下げる
    if (this.draggingSchedule() && this.dropTargetDate() && isSameDay(date, this.dropTargetDate()!) && !isSameDay(date, new Date(this.draggingSchedule()!.startDate))) {
      positions = positions.map(pos => ({
        ...pos,
        row: pos.row + 1
      }));
    }
    //
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

      return visibleSchedules
  }
  getScheduleStyle(position: MonthlyCalendarSchedulePosition): { [key: string]: string } {
    const paddingOffset = (position.duration - 1) * 2 * 0.25;
    const borderOffset = (position.duration - 1) * 2 * 1;

    return {
      position: 'absolute',
      left: '0',
      width: `calc(${position.duration * 100}% + ${paddingOffset}rem + ${borderOffset}px)`,
      top: `${(position.row * 2)}rem`,
    };
  }
  
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

  // ドラッグ中のプレビュー用のスケジュール位置を取得
  getPreviewSchedulePosition(date: Date): MonthlyCalendarSchedulePosition | null {
    if (!this.draggingSchedule() || 
      !this.dropTargetDate() || 
      !isSameDay(date, this.dropTargetDate()!) || 
      isSameDay(date, new Date(this.draggingSchedule()!.startDate))
      ) {
        return null;
      }

    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    const schedule = this.draggingSchedule()!;
    const daysDiff = differenceInDays(date, startOfDay(new Date(schedule.startDate)));
    
    const previewSchedule: Schedule = {
      ...schedule,
      startDate: addDays(new Date(schedule.startDate), daysDiff),
      endDate: addDays(new Date(schedule.endDate), daysDiff),
    };

    return {
      schedule: previewSchedule,
      startOffset: 0,
      row: 0,
      duration: differenceInDays(new Date(previewSchedule.endDate), new Date(previewSchedule.startDate)) + 1,
      isHiddenByDisplaySize: false,
    };
  }


  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  // ドラッグ開始時
  onDragStart(schedule: Schedule, event: DragEvent) {
    event.stopPropagation();
    // ドラッグ画像を非表示にする
    // const dragImage = new Image();
    // dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    // event.dataTransfer?.setDragImage(dragImage, 0, 0);

    this.draggingSchedule.set(schedule);
  }

  // ドラッグ中
  onDragOver(date: Date, event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dropTargetDate.set(date);
  }
  // ドロップ時
  onDrop(targetDate: Date, event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const schedule = this.draggingSchedule();
    if (!schedule) return;

    // 日数の差分を計算
    const currentStart = startOfDay(new Date(schedule.startDate));
    const daysDiff = differenceInDays(targetDate, currentStart);
    
    // 新しいスケジュールを作成
    const updatedSchedule: Schedule = {
      ...schedule,
      startDate: addDays(new Date(schedule.startDate), daysDiff),
      endDate: addDays(new Date(schedule.endDate), daysDiff),
    };

    // 状態をリセット
    this.draggingSchedule.set(null);
    this.dropTargetDate.set(null);
    
    // 更新を通知
    this.updateSchedule.emit(updatedSchedule);
  }
  // ドラッグ終了時
  onDragEnd() {
    this.draggingSchedule.set(null);
    this.dropTargetDate.set(null);
  }

}
