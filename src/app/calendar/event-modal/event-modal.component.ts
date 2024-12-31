import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Schedule } from '../../model/schedule.model';
import { formatDate } from '../../util/date.util';

@Component({
  selector: 'app-event-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './event-modal.component.html',
  styleUrl: './event-modal.component.css'
})
export class EventModalComponent {
  selectedDate = input.required<Date>();
  editingSchedule = input<Schedule>();
  closeModal = output<void>();
  saveSchedule = output<Omit<Schedule, 'id'>>();
  deleteSchedule = output<Schedule>();

  title = '';
  description = '';
  startDate = '';
  endDate = '';
  formatDate = formatDate;

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  ngOnInit() {
    const defaultTime = new Date(this.selectedDate());
    
    if (this.editingSchedule()) {
      this.title = this.editingSchedule()!.title;
      this.description = this.editingSchedule()!.description;
      this.startDate = this.formatDateTimeLocal(this.editingSchedule()!.startDate);
      this.endDate = this.formatDateTimeLocal(this.editingSchedule()!.endDate);
    } else {
      this.startDate = this.formatDateTimeLocal(defaultTime);
      defaultTime.setHours(defaultTime.getHours() + 1);
      this.endDate = this.formatDateTimeLocal(defaultTime);
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal.emit();
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.saveSchedule.emit({
      title: this.title,
      description: this.description,
      startDate: new Date(this.startDate),
      endDate: new Date(this.endDate)
    });
    this.title = '';
    this.description = '';
  }

  onDelete() {
    if (this.editingSchedule()) {
      // this.deleteEvent.emit();
      // this.closeModal.emit();
    }
  }

}
