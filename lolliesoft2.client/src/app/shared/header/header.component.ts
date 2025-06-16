// src/app/shared/header/header.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  constructor(
    public theme: ThemeService,
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.theme.initTheme();
  }

  toggleDark(): void {
    this.theme.toggle();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
