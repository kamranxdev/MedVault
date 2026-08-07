import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideScale,
  lucideShieldCheck,
  lucideFileText,
  lucideAlertTriangle,
  lucideUserCheck,
  lucideGlobe,
  lucideKey,
  lucideChevronLeft,
  lucideLock,
  lucideHeartPulse,
  lucideBan,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIcon],
  providers: [
    provideIcons({
      lucideScale,
      lucideShieldCheck,
      lucideFileText,
      lucideAlertTriangle,
      lucideUserCheck,
      lucideGlobe,
      lucideKey,
      lucideChevronLeft,
      lucideLock,
      lucideHeartPulse,
      lucideBan,
    }),
  ],
  templateUrl: './terms-of-service.component.html',
})
export class TermsOfServiceComponent implements OnInit {
  lastUpdated = 'August 2, 2026';

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }
}
