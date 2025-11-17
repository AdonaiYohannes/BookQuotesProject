import { Component, EventEmitter, Output, Input, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css'
})
export class NavigationComponent {
  @Output() toggleTheme = new EventEmitter<void>();
  @Input() theme: 'light' | 'dark' = 'light';
  isBrowser = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Update navigation state on route changes
    if (this.isBrowser) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        console.log('[Navigation] Route changed, isAuth =', this.auth.isAuthenticated());
      });
    }
  }

  get isDark() { return this.theme === 'dark'; }

  logout() {
    console.log('[Navigation] Logout clicked');
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}