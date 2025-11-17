import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  UserName: string;
  Password: string;
}

export interface AuthResponse {
  token: string;
  userName?: string;
}

export interface RegisterRequest {
  UserName: string;
  Email?: string | null;
  Password: string;
  ConfirmPassword?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = 'jwt_token';
  private base = environment.apiBaseUrl + '/auth';
  private readonly isBrowser: boolean;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // ===== API calls =====

  login(payload: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.base}/login`, payload);
  }

  register(payload: RegisterRequest) {
    return this.http.post(`${this.base}/register`, payload);
  }

  // ===== Token handling (sessionStorage) =====

  get token(): string | null {
    if (!this.isBrowser) return null;
    return sessionStorage.getItem(this.key);
  }

  set token(val: string | null) {
    if (!this.isBrowser) return;
    if (val) {
      sessionStorage.setItem(this.key, val);
    } else {
      sessionStorage.removeItem(this.key);
    }
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    return !!this.token;
  }

  logout(): void {
    this.token = null;
  }
}
