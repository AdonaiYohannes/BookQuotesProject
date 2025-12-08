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
  private userNameKey = 'user_name';
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
    if (this.isBrowser) {
      sessionStorage.removeItem(this.userNameKey);
    } 
  }

   // ===== ✅ NEW METHODS FOR USER INFO =====

  // Extracts and returns the current user's ID from the JWT token
  getCurrentUserId(): number | null {
    if (!this.isBrowser) return null;
    
    const token = this.token;
    if (!token) return null;

    try {
      // Decode JWT token (format: header.payload.signature)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      // JWT can use different claim names for user ID
      // Check common JWT claim names
      const userId = payload.sub || 
                     payload.nameid || 
                     payload.NameIdentifier ||
                     payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      
      return userId ? parseInt(userId, 10) : null;
    } catch (error) {
      console.error('[AuthService] Error decoding token:', error);
      return null;
    }
  }

  
  // Returns the current user's username
  getCurrentUserName(): string | null {
    if (!this.isBrowser) return null;
    return sessionStorage.getItem(this.userNameKey);
  }

  
  // Saves the username to session storage (call this after successful login)
  setUserName(userName: string): void {
    if (!this.isBrowser) return;
    sessionStorage.setItem(this.userNameKey, userName);
  }

  
  // Extracts username from JWT token if not stored separately
  getUserNameFromToken(): string | null {
    if (!this.isBrowser) return null;
    
    const token = this.token;
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      // Check common JWT claim names for username
      return payload.unique_name || 
             payload.name || 
             payload.UserName ||
             payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
             null;
    } catch (error) {
      console.error('[AuthService] Error decoding token:', error);
      return null;
    }
  }
}

