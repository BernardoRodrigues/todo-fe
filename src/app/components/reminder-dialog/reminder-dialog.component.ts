import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { PriorityEnumModel } from 'src/app/models/priority-enum.model';
import { TodoModel } from 'src/app/models/todo.model';
import { TodoService } from 'src/app/services/todo/todo.service';
import { DateValidators } from 'src/app/validators/date.validator';
import { TodoDataService } from 'src/app/services/todo-data/todo-data.service';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-reminder-dialog',
  templateUrl: './reminder-dialog.component.html',
  styleUrls: ['./reminder-dialog.component.scss']
})
export class ReminderDialogComponent implements OnInit {

  private _disable: boolean = false;

  public reminderFormGroup: FormGroup;
  private editing: boolean = false;
  public priorities: {value: number, name: string, color: string}[] = [
    {value: 1, name: 'Low', color: '#0be03d'},
    {value: 2, name: 'Normal', color: '#c8f533'},
    {value: 3, name: 'High', color: '#e60000'},
  ]
  public mode: 'C' | 'R' = 'R';

  constructor(
    private dialogRef: MatDialogRef<ReminderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: {data: TodoModel, mode: 'C' | 'R'},
    private todoService: TodoService,
    private snackbar: MatSnackBar,
    private todoDataService: TodoDataService,
    private dialog: MatDialog
  ) {
    if (this.dialogData != null && this.dialogData.mode != null) {
      this.mode = this.dialogData.mode;
    }
    const startDataDate = dialogData.data == null || dialogData.data.startDate == null ? new Date() : new Date(dialogData.data.startDate);
    const endDataDate = dialogData.data == null || dialogData.data.endDate == null ? new Date() :  new Date(dialogData.data.endDate);
    const startDateTime = dialogData.data == null || dialogData.data.startDate == null ? `00:00` : `${dialogData.data.startDate.getHours()}:${dialogData.data.startDate.getMinutes()}`
    const endDateTime = dialogData.data == null || dialogData.data.endDate == null ? `00:00` : `${dialogData.data.endDate.getHours()}:${dialogData.data.endDate.getMinutes()}`
    this.reminderFormGroup = new FormGroup({
      title: new FormControl(dialogData.data == null || dialogData.data.title == null ? null : dialogData.data.title, [Validators.required]),
      startDateDate: new FormControl(startDataDate, [Validators.required]),
      endDateDate: new FormControl(endDataDate, [Validators.required]),
      startDateTime: new FormControl(startDateTime, [Validators.required]),
      endDateTime: new FormControl(endDateTime, [Validators.required]),
      priority: new FormControl(dialogData.data == null ? null : dialogData.data.priority?.value, [Validators.required]),
      isDone: new FormControl(dialogData.data == null ? false: dialogData.data.isDone == null ? false : dialogData.data.isDone)
    }, {validators: DateValidators.date})
    if (this.mode === 'R') {
      Object.keys(this.reminderFormGroup.controls).forEach((k) => {
        this.reminderFormGroup.controls[k].disable();
        this.reminderFormGroup.get('isDone')?.enable()
      })
    }
  }

  ngOnInit(): void {

  }

  public get disable(): boolean {
    return this._disable;
  }
  public get edit(): boolean {
    return this.editing;
  }

  public getFormControl(name: string): AbstractControl | null {
    return this.reminderFormGroup.get(name);
  }

  public getErrorMessage(name: string): string {
    const control = this.getFormControl(name);
    if (control != null) {
      if (control.hasError('required'))  {
        return 'You must enter a value';
      }
    }
    return '';
  }

  openFromIcon(timepicker: { open: () => void }) {
    timepicker.open();
  }

  public doesDateHaveError(): boolean {
    const startDateDate = this.reminderFormGroup.get('startDateDate') as FormControl;
    const startDateTime = this.reminderFormGroup.get('startDateTime') as FormControl;
    const endDateDate = this.reminderFormGroup.get('endDateDate') as FormControl;
    const endDateTime = this.reminderFormGroup.get('endDateTime') as FormControl;
    return (startDateDate.touched || startDateTime.touched || endDateDate.touched || endDateTime.touched) && this.reminderFormGroup.hasError('date');
  }

  public getDateErrorMessage(): string {
    if (this.doesDateHaveError()) {
      return 'Start date cannot be after end date';
    }
    return '';
  }

  private get startDate(): Date {
    const startDateDate = this.reminderFormGroup.get('startDateDate') as FormControl;
    const startDateTime = this.reminderFormGroup.get('startDateTime') as FormControl;
    const [ startDateHour, startDateMinutes ] = (startDateTime.value as string).split(':');
    return moment(new Date(startDateDate.value)).set('hour', +startDateHour).set('minute', +startDateMinutes).toDate()
  }

  private get endDate(): Date {
    const endDateDate = this.reminderFormGroup.get('endDateDate') as FormControl;
    const endDateTime = this.reminderFormGroup.get('endDateTime') as FormControl;
    const [ endDateHour, endDateMinutes ] = (endDateTime.value as string).split(':')
    return moment(new Date(endDateDate.value)).set('hour', +endDateHour).set('minute', +endDateMinutes).toDate();
  }

  public set edit(value: boolean) {
    this.editing = value;
    if (this.editing) {
      this.reminderFormGroup.enable();
    } else {
      this.reminderFormGroup.disable();
    }
  }

  public get color(): string {
    if (this.dialogData.data == null) return '';
    if (this.dialogData.data.priority == null) {
      return 'green'
    }
    switch(this.dialogData.data.priority.value) {
      default:
      case PriorityEnumModel.Low:
        return 'green'
      case PriorityEnumModel.Normal:
        return 'warning'
      case PriorityEnumModel.High:
        return 'danger'
    }
  }

  public get isDone(): boolean {
    if (this.reminderFormGroup.get('isDone') != null) {
      return this.reminderFormGroup.get('isDone')?.value as boolean;
    }
    return false;
  }

  public createNewReminder() {
    this.dialogRef.disableClose = true;
    Object.keys(this.reminderFormGroup.controls).forEach((k) => {
      this.reminderFormGroup.controls[k].markAsTouched();
    })
    if (this.reminderFormGroup.invalid) {
      this.snackbar.open('The reminder is invalid', 'Dismiss', {politeness: 'assertive', duration: 3*1000});
      return;
    }

    const t = {
      title: (this.reminderFormGroup.get('title') as FormControl).value as string,
      startDate: this.startDate,
      endDate: this.endDate,
      priority: +((this.reminderFormGroup.get('priority') as FormControl).value as string),
      isDone: this.isDone
    }
    this._disable = true;
    this.todoService.create(t).subscribe((v) => {
      this._disable = false;
      const todo: TodoModel = {
        id: v.id,
        title: t.title,
        startDate: t.startDate,
        endDate: t.endDate,
        priority: {
          value: t.priority,
          name: this.priorities.filter((p) => p.value === t.priority)[0].name
        }
      }
      this.dialogRef.close(todo)
      this.snackbar.open("New Reminder Created!", 'Dismiss', {duration: 3*1000})
    })
  }

  public updateReminder(): void {
    this.dialogRef.disableClose = true;
    Object.keys(this.reminderFormGroup.controls).forEach((k) => {
      this.reminderFormGroup.controls[k].markAsTouched();
    })
    if (this.reminderFormGroup.invalid) {
      this.snackbar.open('The reminder is invalid', 'Dismiss', {politeness: 'assertive', duration: 3*1000});
      return;
    }
    const t = {
      title: (this.reminderFormGroup.get('title') as FormControl).value as string,
      startDate: this.startDate,
      endDate: this.endDate,
      priority: +((this.reminderFormGroup.get('priority') as FormControl).value as string),
      isDone: this.isDone
    }
    this._disable = true;
    this.todoService.update(this.dialogData.data.id!!, t.startDate, t.endDate, t.title, t.priority, t.isDone).subscribe((v) => {
      this._disable = false;
      const todo: TodoModel = {
        ...this.dialogData.data,
        title: (this.reminderFormGroup.get('title') as FormControl).value as string,
        startDate: this.startDate,
        endDate: this.endDate,
        priorityId: +((this.reminderFormGroup.get('priority') as FormControl).value as string),
        isDone: this.isDone,
      }
      this.dialogRef.close(todo)
      this.todoDataService.update(todo);
      this.snackbar.open("Reminder Updated!", 'Dismiss', {duration: 3*1000})
    })
  }

  openAlertDialog(): void {
    this.dialog.open(AlertDialogComponent, {
      disableClose: true
    }).afterClosed().subscribe((v) => {
      const answer = v as boolean;
      if (answer) {
        this.todoService.cancel(this.dialogData.data.id!!).subscribe(() => {
          this.todoDataService.remove(this.dialogData.data.id!!)
          this.dialogRef.close()
        })
      }
    })
  }

}
