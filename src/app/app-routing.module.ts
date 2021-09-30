import { DashboardResolver } from './services/dashboard-resolver/dashboard.resolver';

import { AuthGuardService } from './services/auth-guard/auth-guard.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuardService],
    resolve: {
      reminders: DashboardResolver
    }
  },
  {
    path: '/',
    redirectTo: 'home',
    pathMatch: '**'
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: '**'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
