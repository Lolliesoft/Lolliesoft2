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
  // bind this to your search input
  public searchQuery: string = '';

  constructor(
    public theme: ThemeService,
    public authService: AuthService,
    private router: Router
  ) {
    // Expose for console debugging:
    (window as any).authService = this.authService;
  }

  ngOnInit() {
    this.theme.initTheme();
    // Log current roles on init:
    console.log('CurrentUserRoles:', this.authService.getCurrentUserRoles());
    // Also expose roles array directly:
    (window as any).currentUserRoles = this.authService.getCurrentUserRoles();
  }


  toggleDark(): void {
    this.theme.toggle();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  /**
   * Called on each keystroke in the header search box.
   * Navigates to /blog with a `q` query param so your
   * BlogListComponent can pick it up and filter accordingly.
   */
  public searchPosts(): void {
    const q = this.searchQuery.trim();
    this.router.navigate(
      ['/blog'],
      { queryParams: q ? { q } : {} }
    );
  }
}
