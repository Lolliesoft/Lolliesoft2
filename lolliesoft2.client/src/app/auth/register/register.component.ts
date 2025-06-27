// src/app/auth/register/register.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  form: FormGroup;
  errorMessage: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    // Build form with userName, email, password
    this.form = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const { userName, email, password } = this.form.value;
    this.auth.register(userName, email, password).subscribe({
      next: _ => {
        this.loading = false;
        // After successful registration, navigate to login
        this.router.navigate(['/login']);
      },
      error: err => {
        this.loading = false;
        // Pull out the first ModelState error if present
        this.errorMessage =
          err.error?.errors?.UserName?.[0]
          || err.error?.errors?.Email?.[0]
          || err.error?.errors?.Password?.[0]
          || err.error?.message
          || 'Registration failed';
      }
    });
  }
}
