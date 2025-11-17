import { Component, effect, signal, Inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '../components/navigation/navigation';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  theme = signal<'light' | 'dark'>('light');

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private auth: AuthService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') {
        this.theme.set(saved);
      }

      effect(() => {
        const t = this.theme();
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
      });
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Force logout on page refresh/reload
      console.log('[App] Page loaded - clearing authentication');
      this.auth.logout();
    }
  }

  toggleTheme() {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }
}