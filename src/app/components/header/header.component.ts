import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthButtonSubjectService } from 'src/app/services/auth-button-subject/auth-button-subject.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SideBarService } from 'src/app/services/side-bar/side-bar.service';
import { UserService } from 'src/app/services/user/user.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  private _isMenuOpened: boolean = false;


  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private snackbar: MatSnackBar,
    private authButtonSubjectService: AuthButtonSubjectService,
    private sideBarService: SideBarService
  ) {
    this.sideBarService.sideBarOpenObservable().subscribe((v: boolean) => this._isMenuOpened = v);
  }

  ngOnInit(): void {
  }

  public get isLoggedIn(): boolean {
    return this.authService.token != null
  }

  public get isMenuOpened(): boolean {
    return this._isMenuOpened
  }

  public set isMenuOpened(value: boolean) {
    this._isMenuOpened = value
    this.sideBarService.sideBarOpen(this._isMenuOpened)
  }

  public get userName(): string | null {
    const user = this.authService.user;
    if (user == null) return null;
    return `${user.firstName} ${user.lastName}`
  }

  public logout(): void {
    this.userService.logout().subscribe(() => {
      this.authService.token = null;
      this.authService.user = null;
      this.router.navigate(['/home'])
    })
  }

  public openLoginDialog(): void {
    // this.dialog.open(LoginComponent).afterClosed().subscribe(this.afterDialogClose)
    this.authButtonSubjectService.authButtonPressed('login')
  }

  private afterDialogClose(value: any) {
    // this.subscriptionService.subscribe();
    this.snackbar.open(`Welcome back ${value.user.firstName}!`, 'Dismiss', { duration: 3 * 1000 });
    this.router.navigate(['/dashboard']);
  }

  public openSignupDialog(): void {
    // this.dialog.open(SignupComponent).afterClosed().subscribe(this.afterDialogClose)
    this.authButtonSubjectService.authButtonPressed('signin')
  }

}
