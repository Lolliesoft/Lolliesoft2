import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Import the AuthInterceptor you created
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
    AppRoutingModule
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
