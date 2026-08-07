import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideShieldCheck,
  lucideLock,
  lucideFileText,
  lucideUserCheck,
  lucideActivity,
  lucideServer,
  lucideKey,
  lucideGlobe,
  lucideHeartPulse,
  lucideChevronLeft,
  lucideScale,
  lucideAlertCircle,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIcon],
  providers: [
    provideIcons({
      lucideShieldCheck,
      lucideLock,
      lucideFileText,
      lucideUserCheck,
      lucideActivity,
      lucideServer,
      lucideKey,
      lucideGlobe,
      lucideHeartPulse,
      lucideChevronLeft,
      lucideScale,
      lucideAlertCircle,
    }),
  ],
  templateUrl: './privacy-policy.component.html',
})
export class PrivacyPolicyComponent implements OnInit {
  lastUpdated = 'August 2, 2026';

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }
}
