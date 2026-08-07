import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { JwtAuthResponse } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  currentUser = signal<JwtAuthResponse | null>(this.getStoredUser());

  constructor(private http: HttpClient) {}

  isTokenExpired(token: string | null, offsetSeconds = 5): boolean {
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      if (payload && payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        return payload.exp < (now + offsetSeconds);
      }
      return false;
    } catch (e) {
      return true;
    }
  }

  isLoggedIn(): boolean {
    const user = this.currentUser();
    const token = localStorage.getItem('medvault_token');
    if (!user || !token || this.isTokenExpired(token)) {
      if (user || token) {
        this.logout();
      }
      return false;
    }
    return true;
  }

  login(credentials: { username: string; password: string }): Observable<JwtAuthResponse> {
    return this.http.post<JwtAuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        res.id = res.userId;
        localStorage.setItem('medvault_token', res.accessToken);
        localStorage.setItem('medvault_user', JSON.stringify(res));
        this.currentUser.set(res);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('medvault_token');
    localStorage.removeItem('medvault_user');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    const token = localStorage.getItem('medvault_token');
    if (this.isTokenExpired(token)) {
      this.logout();
      return null;
    }
    return token;
  }

  getStoredUser(): JwtAuthResponse | null {
    const token = localStorage.getItem('medvault_token');
    if (this.isTokenExpired(token)) {
      localStorage.removeItem('medvault_token');
      localStorage.removeItem('medvault_user');
      return null;
    }
    const data = localStorage.getItem('medvault_user');
    if (!data) return null;
    try {
      const user = JSON.parse(data);
      if (user && !user.id && user.userId) user.id = user.userId;
      return user;
    } catch (e) {
      this.logout();
      return null;
    }
  }

  hasRole(role: string): boolean {
    if (!this.isLoggedIn()) return false;
    const user = this.currentUser();
    if (!user) return false;
    const target = role.startsWith('ROLE_') ? role : 'ROLE_' + role.toUpperCase();
    return user.roles.includes(target);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((r) => this.hasRole(r));
  }

  isReceptionist(): boolean {
    return this.hasRole('ROLE_RECEPTIONIST') || this.hasRole('ROLE_ADMIN');
  }

  isNurse(): boolean {
    return this.hasRole('ROLE_NURSE') || this.hasRole('ROLE_ADMIN');
  }

  isDoctor(): boolean {
    return this.hasRole('ROLE_DOCTOR') || this.hasRole('ROLE_ADMIN');
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  isPatient(): boolean {
    return this.hasRole('ROLE_PATIENT');
  }

  getPrimaryRole(): 'Patient' | 'Doctor' | 'Nurse' | 'Receptionist' | 'Admin' {
    if (this.hasRole('ROLE_ADMIN')) return 'Admin';
    if (this.hasRole('ROLE_RECEPTIONIST')) return 'Receptionist';
    if (this.hasRole('ROLE_DOCTOR')) return 'Doctor';
    if (this.hasRole('ROLE_NURSE')) return 'Nurse';
    return 'Patient';
  }

  createStaffUser(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/create-user`, payload);
  }
}
