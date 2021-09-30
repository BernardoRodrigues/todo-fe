import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthButtonSubjectService } from 'src/app/services/auth-button-subject/auth-button-subject.service';
import { LoginSubjectService } from 'src/app/services/login-subject/login-subject.service';
import { LoginComponent } from '../login/login.component';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  constructor(
    private authButtonSubjectService: AuthButtonSubjectService,
    public snackbar: MatSnackBar,
    public router: Router,
    private dialog: MatDialog,
    public loginSubjectService: LoginSubjectService,
    private activatedRoute: ActivatedRoute
  ) {
    this.subscription = this.authButtonSubjectService.authButtonPressedObservable().subscribe((v) => {
      if (v === 'login') {
          this.dialog.open(LoginComponent).afterClosed().subscribe((v) => this.afterDialogClose(this, v))
      } else if (v === 'signin') {
          this.dialog.open(SignupComponent).afterClosed().subscribe((v) => this.afterDialogClose(this, v))
      }
    })
    this.activatedRoute.queryParamMap.subscribe((params) => {
      if (params.has('returnUrl')) {
        this.dialog.open(LoginComponent).afterClosed().subscribe((v) => this.afterDialogClose(this, v, params.get('returnUrl')))
      }
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {

  }

  private afterDialogClose(pointer: HomeComponent, value: any, returnUrl: string | null = null) {
    if (value != null) {
      pointer.loginSubjectService.userLogIn();
      pointer.snackbar.open(`Welcome back ${value.user.firstName}!`, 'Dismiss', { duration: 3 * 1000 });
      if (returnUrl == null) {

        pointer.router.navigate(['/dashboard']);
      } else {
        pointer.router.navigate([returnUrl]);
      }
    }
  }

}
