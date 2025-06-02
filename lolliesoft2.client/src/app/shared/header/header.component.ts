import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  constructor(public theme: ThemeService) { }

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
}
