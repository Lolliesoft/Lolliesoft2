// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogListComponent } from './blog/blog-list/blog-list.component';
import { BlogDetailComponent } from './blog/blog-detail/blog-detail.component';
import { BlogEditorComponent } from './blog/blog-editor/blog-editor.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  // Public blog pages
  { path: 'blog', component: BlogListComponent },
  { path: 'blog/:id', component: BlogDetailComponent },

  // Admin/editor pages (protected)
  {
    path: 'admin/blog',
    component: BlogEditorComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/blog/:id',
    component: BlogEditorComponent,
    canActivate: [AuthGuard]
  },

  // Login page
  { path: 'login', component: LoginComponent },

  // Default & fallback
  { path: '', redirectTo: 'blog', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
