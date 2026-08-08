import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Capability } from '../models/permissions.model';

@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  private requiredCapability: Capability | string | null = null;

  @Input('hasPermission') set permission(val: Capability | string) {
    this.requiredCapability = val;
    this.updateView();
  }

  constructor() {
    effect(() => {
      // Re-evaluate when current user signal changes
      this.authService.currentUser();
      this.updateView();
    });
  }

  private updateView(): void {
    if (!this.requiredCapability) {
      this.viewContainer.clear();
      return;
    }

    const hasPerm = this.authService.hasCapability(this.requiredCapability as Capability);
    if (hasPerm) {
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainer.clear();
    }
  }
}
