// src/app/app.module.ts

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// TinyMCE wrapper
import { EditorModule } from '@tinymce/tinymce-angular';

// JWT interceptor
import { AuthInterceptor } from './core/auth.interceptor';

// Auth components & services
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthService } from './services/auth.service';

// Blog components
import { BlogListComponent } from './blog/blog-list/blog-list.component';
import { BlogDetailComponent } from './blog/blog-detail/blog-detail.component';
import { BlogEditorComponent } from './blog/blog-editor/blog-editor.component';

// Shared
import { HeaderComponent } from './shared/header/header.component';
import { ThemeService } from './shared/theme.service';

@NgModule({
  declarations: [
    AppComponent,

    // auth
    LoginComponent,
    RegisterComponent,           // ← Add register UI

    // blog
    BlogListComponent,
    BlogDetailComponent,
    BlogEditorComponent,

    // layout
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,         // ← for [formGroup]
    FormsModule,                 // ← for [(ngModel)]
    AppRoutingModule,
    EditorModule
  ],
  providers: [
    AuthService,
    ThemeService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
