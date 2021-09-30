import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss']
})
export class AlertDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<AlertDialogComponent>
  ) { }

  ngOnInit(): void {
  }

  close(affirmative: boolean) {
    this.dialogRef.close(affirmative)
  }

}
