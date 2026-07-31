import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private hasView = false;
  private requiredRole = '';

  @Input() set hasRole(role: string) {
    this.requiredRole = role;
    this.updateView();
  }

  constructor() {
    effect(() => {
      this.authService.currentUser();
      this.updateView();
    });
  }

  private updateView(): void {
    if (!this.requiredRole) return;
    const isAuthorized = this.authService.hasRole(this.requiredRole);
    if (isAuthorized && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isAuthorized && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

@Directive({
  selector: '[hasAnyRole]',
  standalone: true
})
export class HasAnyRoleDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private hasView = false;
  private requiredRoles: string[] = [];

  @Input() set hasAnyRole(roles: string[]) {
    this.requiredRoles = roles || [];
    this.updateView();
  }

  constructor() {
    effect(() => {
      this.authService.currentUser();
      this.updateView();
    });
  }

  private updateView(): void {
    if (!this.requiredRoles || this.requiredRoles.length === 0) return;
    const isAuthorized = this.authService.hasAnyRole(this.requiredRoles);
    if (isAuthorized && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isAuthorized && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
