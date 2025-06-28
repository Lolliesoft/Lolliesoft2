// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BlogListComponent } from './blog/blog-list/blog-list.component';
import { BlogDetailComponent } from './blog/blog-detail/blog-detail.component';
import { BlogEditorComponent } from './blog/blog-editor/blog-editor.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';

import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';

const routes: Routes = [
  // Public blog pages
  { path: 'blog', component: BlogListComponent },
  { path: 'blog/:id', component: BlogDetailComponent },

  // Authentication
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Blog editor (Authors & Admins)
  {
    path: 'admin/blog/new',
    component: BlogEditorComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/blog/edit/:id',
    component: BlogEditorComponent,
    canActivate: [AuthGuard]
  },

  // User management (Admins only)
  {
    path: 'admin/users',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard]
  },

  // Default & fallback
  { path: '', redirectTo: 'blog', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
