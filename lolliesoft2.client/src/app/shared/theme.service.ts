import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private renderer: Renderer2;
  private themeKey = 'theme';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /** Initialize the theme when the app starts */
  initTheme(): void {
    const savedTheme = localStorage.getItem(this.themeKey);
    if (savedTheme === 'dark') {
      this.renderer.setAttribute(document.documentElement, 'data-theme', 'dark');
    } else {
      // Default to light mode: ensure no data-theme attribute
      this.renderer.removeAttribute(document.documentElement, 'data-theme');
    }
  }

  /** Enable dark mode */
  enableDarkMode(): void {
    this.renderer.setAttribute(document.documentElement, 'data-theme', 'dark');
    localStorage.setItem(this.themeKey, 'dark');
  }

  /** Disable dark mode */
  disableDarkMode(): void {
    // Removing the attribute falls back to light mode
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
    localStorage.setItem(this.themeKey, 'light');
  }

  /** Toggle light ↔ dark */
  toggle(): void {
    if (this.isDarkModeEnabled()) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }

  /** Expose current mode to templates */
  isDarkModeEnabled(): boolean {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }
}
