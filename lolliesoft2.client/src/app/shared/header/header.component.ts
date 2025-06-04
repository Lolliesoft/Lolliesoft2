import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../theme.service';
// Correct the path to AuthService:
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  constructor(
    public theme: ThemeService,
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.theme.initTheme();
  }

  ngAfterViewInit() {
    const toggleEl = document.getElementById('theme-toggle') as HTMLInputElement;
    if (!toggleEl) {
      return;
    }

    // Set the checkbox based on the current theme
    toggleEl.checked = this.theme.isDarkModeEnabled();

    // When the user flips the switch, call theme.toggle()
    toggleEl.addEventListener('change', () => {
      this.toggleDark();
    });
  }

  toggleDark() {
    this.theme.toggle();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
