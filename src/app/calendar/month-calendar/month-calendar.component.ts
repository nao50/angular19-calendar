import { Component, input, output } from '@angular/core';
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
export class MonthCalendarComponent {
  dayOfWeeks = ['日', '月', '火', '水', '木', '金', '土'];
  currentDate = input.required<Date>();
  daysDisplayedWithinMonth = input<Date[]>([]);
  editSchedule = output<Schedule>();
  schedules = input<Schedule[]>();
  createSchedule = output<Date>();
  //
  eventPositions: MonthlyCalendarSchedulePosition[] = [];

  formatDate = formatDate;
  isSameMonth = isSameMonth;
  isToday = isToday;

  get gridRowsClass(): string {
    const weeksCount = getCalendarWeeksCount(this.currentDate());
    return `grid grid-cols-7 grid-rows-${weeksCount - 1} border`;
  }

  getPositionsForDay(date: Date): MonthlyCalendarSchedulePosition[] {
    const sp = calculateSchedulePositions(this.schedules()!, date, this.daysDisplayedWithinMonth().length)

    console.log('sp:', sp)

    const aaa = sp.filter(pos => 
      pos.row === this.daysDisplayedWithinMonth().findIndex(d => 
        d.getTime() === date.getTime()
      )
    );

    return aaa
  }
}
