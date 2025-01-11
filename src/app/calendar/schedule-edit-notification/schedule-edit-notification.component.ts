import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-schedule-edit-notification',
  imports: [],
  templateUrl: './schedule-edit-notification.component.html',
  styleUrl: './schedule-edit-notification.component.css'
})
export class ScheduleEditNotificationComponent {
  saving = input<boolean>();
  close = output<void>();
  isUndo = input<boolean>();
  canUndo = input<boolean>();
  undo = output<void>();
}
