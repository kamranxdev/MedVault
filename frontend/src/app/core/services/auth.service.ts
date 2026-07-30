import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { JwtAuthResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  
  currentUser = signal<JwtAuthResponse | null>(this.getStoredUser());

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<JwtAuthResponse> {
    return this.http.post<JwtAuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        res.id = res.userId;
        localStorage.setItem('medvault_token', res.accessToken);
        localStorage.setItem('medvault_user', JSON.stringify(res));
        this.currentUser.set(res);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('medvault_token');
    localStorage.removeItem('medvault_user');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('medvault_token');
  }

  getStoredUser(): JwtAuthResponse | null {
    const data = localStorage.getItem('medvault_user');
    if (!data) return null;
    const user = JSON.parse(data);
    if (user && !user.id && user.userId) user.id = user.userId;
    return user;
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    const target = role.startsWith('ROLE_') ? role : 'ROLE_' + role.toUpperCase();
    return user.roles.includes(target);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(r => this.hasRole(r));
  }
}
