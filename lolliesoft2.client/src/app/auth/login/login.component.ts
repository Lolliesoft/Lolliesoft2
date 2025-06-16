// src/app/auth/login/login.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';  // ← HERE

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  returnUrl!: string;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,           // same service!
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    // strip leading slash so Router.navigate can match
    const raw = this.route.snapshot.queryParams['returnUrl'] || '';
    this.returnUrl = raw.replace(/^\/+/, '');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: res => {
        this.authService.setToken(res.token);
        // navigate *after* setToken, guard will now see isLoggedIn()===true
        this.router.navigate(this.returnUrl ? [this.returnUrl] : ['/']);
      },
      error: err => {
        this.errorMessage = 'Login failed. Please check your credentials.';
      }
    });
  }
}
