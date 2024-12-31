import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Schedule } from '../model/schedule.model';
import { isSameDay, isWithinInterval } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  // private schedules = new BehaviorSubject<Schedule[]>([]);
  schedules = signal<Schedule[]>([]);

  addSchedule(schedule: Omit<Schedule, 'id'>): void {
    const newSchedule = {
      ...schedule,
      id: crypto.randomUUID().toString()
    };
    // this.schedules.next([...this.schedules.value, newSchedule]);
    this.schedules.update(v => {
      return [...v, newSchedule];
    });
  }

  updateSchedule(schedule: Schedule): void {
    this.schedules.update(values => {
      return values.map(s => {
        return s.id === schedule.id ? schedule : s
      })
    });
    // const updatedSchedules = this.schedules.value.map(s => 
    //   s.id === schedule.id ? schedule : s
    // );
    // this.schedules.next(updatedSchedules);
  }

  deleteSchedule(id: string): void {
    this.schedules.update(values => {
      return values.filter(s =>  s.id !== id)
    });
    // const filteredSchedules = this.schedules.value.filter(s => s.id !== id);
    // this.schedules.next(filteredSchedules);
  }

  getSchedulesForDate(date: Date): Schedule[] {
    return this.schedules().filter(schedule => 
      isWithinInterval(date, { 
        start: new Date(schedule.startDate), 
        end: new Date(schedule.endDate) 
      }) ||
      isSameDay(date, schedule.startDate) ||
      isSameDay(date, schedule.endDate)
    );
  }
}