import { Component, input, output } from '@angular/core';
import { Schedule } from '../../model/schedule.model';
import { formatDate, isSameDay } from '../../util/date.util';

@Component({
  selector: 'app-schedule',
  imports: [],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent {
  schedule = input.required<Schedule>();
  editSchedule = output<Schedule>();

  formatDate = formatDate;

  get isMultiDay(): boolean {
    return !isSameDay(this.schedule().startDate, this.schedule().endDate);
  }
}
