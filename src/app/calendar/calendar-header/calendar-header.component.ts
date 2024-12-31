import { Component, input, output } from '@angular/core';
import { formatDate } from '../../util/date.util';
import { CalendarViewMode } from '../../model/calendar.model';

@Component({
  selector: 'app-calendar-header',
  imports: [],
  templateUrl: './calendar-header.component.html',
  styleUrl: './calendar-header.component.css'
})
export class CalendarHeaderComponent {
  currentDate = input.required<Date>();
  viewMode = input.required<CalendarViewMode>();
  viewModeChange = output<CalendarViewMode>();
  previous = output<void>();
  next = output<void>();
  today = output<void>();

  views: CalendarViewMode[] = ['Month', 'Week', 'Day'];
  formatDate = formatDate;

  get viewTitleFormat(): string {
    switch (this.viewMode()) {
      case 'Month':
        return 'yyyy年MM月';
      case 'Week':
        return 'yyyy年MM月dd日 週';
      case 'Day':
        return 'yyyy年MM月dd日(E)';
    }
  }
}
