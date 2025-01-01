import { Component, input, output } from '@angular/core';
import { ScheduleComponent } from '../schedule/schedule.component';
import { formatDate } from '../../util/date.util';
import { isSameMonth, isSameDay, isToday } from 'date-fns';
import { Schedule } from '../../model/schedule.model';
import { calculateSchedulePositionsForWeeklyCalender } from '../../util/calendar.util';

@Component({
  selector: 'app-week-calendar',
  imports: [ScheduleComponent],
  templateUrl: './week-calendar.component.html',
  styleUrl: './week-calendar.component.css'
})
export class WeekCalendarComponent {
  daysDisplayedWithinMonth = input<Date[]>([]);
  schedules = input<Schedule[]>();
  hoursDisplayedWithinDay = Array.from({ length: 24 }, (_, i) => 
    `${String(i).padStart(2, '0')}:00`
  );
  createSchedule = output<Date>();
  editSchedule = output<Schedule>();

  formatDate = formatDate;
  isToday = isToday;

  createScheduleFromWeeklyCalender(event: MouseEvent, date: Date) {
    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const hourHeight = element.offsetHeight;
    const minutes = Math.floor((y / hourHeight) * 60 / 10) * 10;
    
    const newDate = new Date(date);
    const hourElement = element.closest('.relative');
    const hourIndex = Array.from(hourElement?.parentElement?.children || [])
      .indexOf(hourElement as Element);
    
    newDate.setHours(hourIndex, minutes, 0, 0);
    this.createSchedule.emit(newDate);
  }

  getSchedules(date: Date): Schedule[] {
    return this.schedules()!.filter(schedule => isSameDay(new Date(schedule.startDate), date));
  }

  getEventStyle(event: Schedule) {
    return calculateSchedulePositionsForWeeklyCalender(event);
  }
}
