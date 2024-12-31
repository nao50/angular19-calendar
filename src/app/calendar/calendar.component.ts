import { Component, inject, computed } from '@angular/core';
import { CalendarHeaderComponent } from './calendar-header/calendar-header.component';
import { MonthCalendarComponent } from './month-calendar/month-calendar.component';
import { EventModalComponent } from './event-modal/event-modal.component';
import { ScheduleService } from '../service/schedule.service';
import { CalendarViewMode } from '../model/calendar.model';
import { Schedule } from '../model/schedule.model';
import { generateCalendarDays } from '../util/date.util';

import { 
  addDays,
  addWeeks,
  addMonths,
} from 'date-fns';

@Component({
  selector: 'app-calendar',
  imports: [CalendarHeaderComponent, MonthCalendarComponent, EventModalComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {
  scheduleService = inject(ScheduleService);
  schedules = computed(() => this.scheduleService.schedules());
  currentDate = new Date();
  currentViewMode: CalendarViewMode = 'Month';
  calendarDays: Date[] = [];
  showModal = false;
  selectedDate: Date | null = null;
  editingSchedule: Schedule | undefined = undefined;

  ngOnInit() {
    this.generateDays();
  }

  changeViewMode(view: CalendarViewMode) {
    this.currentViewMode = view;
    this.generateDays();
  }

  generateDays() {
    switch (this.currentViewMode) {
      case 'Month':
        this.calendarDays = generateCalendarDays(this.currentDate);
        break;
      // case 'Week':
      //   this.calendarDays = getWeekDays(this.currentDate);
      //   break;
      // case 'Day':
      //   this.calendarDays = [this.currentDate];
      //   break;
    }
  }

  navigatePrevious() {
    switch (this.currentViewMode) {
      case 'Month':
        this.currentDate = addMonths(this.currentDate, -1);
        break;
      case 'Week':
        this.currentDate = addWeeks(this.currentDate, -1);
        break;
      case 'Day':
        this.currentDate = addDays(this.currentDate, -1);
        break;
    }
    this.generateDays();
  }

  navigateNext() {
    switch (this.currentViewMode) {
      case 'Month':
        this.currentDate = addMonths(this.currentDate, 1);
        break;
      case 'Week':
        this.currentDate = addWeeks(this.currentDate, 1);
        break;
      case 'Day':
        this.currentDate = addDays(this.currentDate, 1);
        break;
    }
    this.generateDays();
  }

  goToToday() {
    this.currentDate = new Date();
    this.generateDays();
  }

  openModal(date: Date) {
    this.selectedDate = date;
    this.editingSchedule = undefined;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedDate = null;
    this.editingSchedule = undefined;
  }

  saveSchedule(schedule: Omit<Schedule, 'id'>) {
    // console.log('schedule', schedule);
    if (this.editingSchedule) {
      this.scheduleService.updateSchedule({
        ...this.editingSchedule,
        ...schedule
      });
    } else if (this.selectedDate) {
      this.scheduleService.addSchedule(schedule);
    }
    this.closeModal();
  }

  deleteSchedule(schedule: Schedule) {
    this.scheduleService.deleteSchedule(schedule.id);
    this.closeModal();
  }

  getSchedulesForDay(date: Date, hour: string): Schedule[] {
    const [hourStr] = hour.split(':');
    const startTime = new Date(date);
    startTime.setHours(parseInt(hourStr, 10), 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    return this.scheduleService.getSchedulesForDate(date)
      .filter(schedule => {
        console.log('schedule', schedule)
        const start = new Date(schedule.startDate);
        return start >= startTime && start < endTime;
      });
  }
}
