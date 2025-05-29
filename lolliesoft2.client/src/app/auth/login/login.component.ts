import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  returnUrl!: string;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Get returnUrl from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: err => {
        this.errorMessage = 'Login failed. Please check your credentials.';
        console.error(err);
      }
    });
  }
}


// src/app/auth/login/login.component.html
/*
<div class="login-container">
  <h2>Login</h2>
  <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
    <div>
      <label for="email">Email</label>
      <input id="email" type="email" formControlName="email" />
      <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="error">
        <small *ngIf="loginForm.get('email')?.errors?.['required']">Email is required.</small>
        <small *ngIf="loginForm.get('email')?.errors?.['email']">Invalid email format.</small>
      </div>
    </div>

    <div>
      <label for="password">Password</label>
      <input id="password" type="password" formControlName="password" />
      <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="error">
        <small *ngIf="loginForm.get('password')?.errors?.['required']">Password is required.</small>
        <small *ngIf="loginForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters.</small>
      </div>
    </div>

    <div *ngIf="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <button type="submit" [disabled]="loginForm.invalid">Login</button>
  </form>
</div>
*/
