import { Component, signal, inject, computed, output } from '@angular/core';
import { CalendarHeaderComponent } from './calendar-header/calendar-header.component';
import { MonthCalendarComponent } from './month-calendar/month-calendar.component';
import { WeekCalendarComponent } from './week-calendar/week-calendar.component';
import { EventModalComponent } from './event-modal/event-modal.component';
import { ScheduleEditNotificationComponent } from './schedule-edit-notification/schedule-edit-notification.component';
import { ScheduleService } from '../service/schedule.service';
import { CalendarViewMode } from '../model/calendar.model';
import { Schedule } from '../model/schedule.model';
import { generateCalendarDays } from '../util/date.util';
import { getWeekDays } from '../util/calendar.util';

import { 
  addDays,
  addWeeks,
  addMonths,
} from 'date-fns';

@Component({
  selector: 'app-calendar',
  imports: [CalendarHeaderComponent, MonthCalendarComponent, WeekCalendarComponent, EventModalComponent, ScheduleEditNotificationComponent],
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
  showNotification = signal(false);
  saving = signal(false);
  isUndoNotification = signal(false);

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
      case 'Week':
        this.calendarDays = getWeekDays(this.currentDate);
        break;
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
    this.showNotification.set(false);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedDate = null;
    this.editingSchedule = undefined;
  }

  closeNotification() {
    this.showNotification.set(false);
  }

  async undoLastChange() {
    this.saving.set(true);
    this.isUndoNotification.set(true);
    this.showNotification.set(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    switch (this.scheduleService.lastModifiedSchedule()!.type) {
      case 'create':
        this.scheduleService.deleteSchedule(this.scheduleService.lastModifiedSchedule()!.schedule)
        break;
      case 'update':
        this.scheduleService.updateSchedule(this.scheduleService.lastModifiedSchedule()!.schedule)
        break;
      case 'delete':
        this.scheduleService.reCreateSchedule(this.scheduleService.lastModifiedSchedule()!.schedule)
        break;
    }

    this.saving.set(false);
    setTimeout(() => {
      this.showNotification.set(false);
    }, 5000);

    this.scheduleService.lastModifiedSchedule.set(null)
  }

  canUndo(): boolean {
    return this.scheduleService.lastModifiedSchedule() !== null;
  }

  async updateSchedule(schedule: Schedule) {
    this.saving.set(true);
    this.showNotification.set(true);
    this.isUndoNotification.set(false);

    // 実際のAPI呼び出しの代わりに1秒待機
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.scheduleService.updateSchedule(schedule);
    this.saving.set(false);
    setTimeout(() => {
      this.showNotification.set(false);
    }, 5000);
  }

  async createSchedule(schedule: Omit<Schedule, 'id'>) {
    this.saving.set(true);
    this.showNotification.set(true);
    this.isUndoNotification.set(false);

    // 実際のAPI呼び出しの代わりに1秒待機
    // await new Promise(resolve => setTimeout(resolve, 1000));

    if (this.editingSchedule) {
      this.scheduleService.updateSchedule({
        ...this.editingSchedule,
        ...schedule
      });
    } else if (this.selectedDate) {
      this.scheduleService.createSchedule(schedule);
    }
    this.closeModal();

    // 
    this.saving.set(false);
    setTimeout(() => {
      this.showNotification.set(false);
    }, 5000);
  }

  editSchedule(schedule: Schedule) {
    this.selectedDate = new Date(schedule.startDate);
    this.editingSchedule = schedule;
    this.showModal = true;
  }

  deleteSchedule(schedule: Schedule) {
    this.isUndoNotification.set(false);

    this.scheduleService.deleteSchedule(schedule);
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
        const start = new Date(schedule.startDate);
        return start >= startTime && start < endTime;
      });
  }
}
