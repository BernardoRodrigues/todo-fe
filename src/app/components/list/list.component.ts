import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TodoModel } from 'src/app/models/todo.model';
import { TodoDataService } from 'src/app/services/todo-data/todo-data.service';
import { TodoService } from 'src/app/services/todo/todo.service';
import { ReminderDialogComponent } from '../reminder-dialog/reminder-dialog.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  public todosDone: TodoModel[];
  public todosNotDone: TodoModel[];

  constructor(
    private todoDataService: TodoDataService,
    private activatedRoute: ActivatedRoute,
    private todoService: TodoService,
    private dialog: MatDialog,
  ) {
    this.activatedRoute.data.subscribe((data) => {
      const reminders: TodoModel[] = data.reminders;
      if (reminders != null) {
        this.todosDone = reminders.filter((t) => !t.isCancelled && t.isDone)
        this.todosNotDone = reminders.filter((t) => !t.isCancelled && !t.isDone)
      }
    });
    this.todosDone = this.todoDataService.reminders.filter((t) => !t.isCancelled && t.isDone)
    this.todosNotDone = this.todoDataService.reminders.filter((t) => !t.isCancelled && !t.isDone)
    this.todoDataService.todoDataObs.subscribe((v) => {
      this.todosDone = v.filter((t) => !t.isCancelled && t.isDone)
      this.todosNotDone = v.filter((t) => !t.isCancelled && !t.isDone)
    })
  }

  ngOnInit(): void {
  }

  drop(event: CdkDragDrop<TodoModel[]>, from: 'TODO' | 'DONE') {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      if (from === 'TODO') {
        const todo = this.todosDone[event.previousIndex];
        todo.isDone = false;
        
        this.todoService.updateStatus(todo.id || '', todo.isDone).subscribe(() => {
          this.todoDataService.update(todo)
          this.todosNotDone.push(todo)
        })
      } else {
        const todo = this.todosNotDone[event.previousIndex];
        todo.isDone = true;
        this.todoService.updateStatus(todo.id || '', todo.isDone).subscribe(() => {
          this.todoDataService.update(todo)
          this.todosDone.push(todo)
        })
        
      }
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      
    }
  }

  public openDialog(t: TodoModel) {
    this.dialog.open(ReminderDialogComponent, 
      {
        data: {
          data: t,
          mode: 'R'
        },
      })
  }

}
