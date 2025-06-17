// src/app/app.module.ts

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; // ✅ FormsModule added here

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// ← TinyMCE’s Angular wrapper
import { EditorModule } from '@tinymce/tinymce-angular';

// ← Your JWT interceptor
import { AuthInterceptor } from './core/auth.interceptor';

import { LoginComponent } from './auth/login/login.component';
import { BlogListComponent } from './blog/blog-list/blog-list.component';
import { BlogDetailComponent } from './blog/blog-detail/blog-detail.component';
import { BlogEditorComponent } from './blog/blog-editor/blog-editor.component';
import { HeaderComponent } from './shared/header/header.component';
import { ThemeService } from './shared/theme.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BlogListComponent,
    BlogDetailComponent,
    BlogEditorComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule, // ✅ Add it here
    AppRoutingModule,

    // ← Make the <editor> component available
    EditorModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    ThemeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
