import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { Plus } from '@primeicons/angular/plus';
import { ChevronDown } from '@primeicons/angular/chevron-down';
import { EllipsisV } from '@primeicons/angular/ellipsis-v';
import { Sidebar } from '@primeicons/angular/sidebar';
import { PIcon } from '@primeicons/angular/p-icon';

interface NavItem {
    icon: string;
    label: string;
    isActive?: boolean;
    badge?: string;
    subItems?: { label: string; isActive?: boolean }[];
}

interface NavGroup {
    label: string;
    action?: boolean;
    items: NavItem[];
}

@Component({
    selector: 'app-sidebar-preview-demo',
    template: `
        <div class="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
            <p-sidebar-layout class="min-h-192! relative!">
                @if (isMobile() && open()) {
                    <p-sidebar-backdrop class="absolute!" />
                }
                <p-sidebar id="preview" [collapsible]="isMobile() ? 'offcanvas' : 'icon'" [overlay]="isMobile()" [(open)]="open">
                    <p-sidebar-spacer />
                    <p-sidebar-aside>
                        <p-sidebar-panel>
                            <p-sidebar-header>
                                <p-sidebar-menu>
                                    <p-sidebar-menu-item>
                                        <button pSidebarMenuButton class="p-1!">
                                            <div class="flex size-6 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-violet-500 to-indigo-600 text-white text-xs font-bold leading-none">A</div>
                                            <span class="font-semibold text-sm">Acme Inc</span>
                                        </button>
                                    </p-sidebar-menu-item>
                                </p-sidebar-menu>
                            </p-sidebar-header>
                            <p-sidebar-content>
                                @for (group of navGroups; track group.label) {
                                    <p-sidebar-group>
                                        <p-sidebar-group-label>{{ group.label }}</p-sidebar-group-label>
                                        @if (group.action) {
                                            <button pSidebarGroupAction><svg data-p-icon="plus"></svg></button>
                                        }
                                        <p-sidebar-group-content>
                                            <p-sidebar-menu>
                                                @for (item of group.items; track item.label) {
                                                    <p-sidebar-menu-item [collapsible]="!!item.subItems" [defaultOpen]="hasActiveSub(item)">
                                                        <button pSidebarMenuButton [isActive]="!!item.isActive">
                                                            <svg [pIcon]="item.icon"></svg>
                                                            <span>{{ item.label }}</span>
                                                            @if (item.subItems) {
                                                                <svg data-p-icon="chevron-down" class="ml-auto"></svg>
                                                            }
                                                        </button>
                                                        @if (item.badge) {
                                                            <p-sidebar-menu-badge>{{ item.badge }}</p-sidebar-menu-badge>
                                                        }
                                                        @if (item.subItems) {
                                                            <p-sidebar-menu-sub>
                                                                @for (sub of item.subItems; track sub.label) {
                                                                    <p-sidebar-menu-sub-item>
                                                                        <button pSidebarMenuSubButton [isActive]="!!sub.isActive">
                                                                            <span>{{ sub.label }}</span>
                                                                        </button>
                                                                    </p-sidebar-menu-sub-item>
                                                                }
                                                            </p-sidebar-menu-sub>
                                                        } @else if (!item.badge) {
                                                            <button pSidebarMenuAction showOnHover><svg data-p-icon="ellipsis-v"></svg></button>
                                                        }
                                                    </p-sidebar-menu-item>
                                                }
                                            </p-sidebar-menu>
                                        </p-sidebar-group-content>
                                    </p-sidebar-group>
                                }
                            </p-sidebar-content>
                            <p-sidebar-footer>
                                <p-sidebar-menu>
                                    <p-sidebar-menu-item>
                                        <button pSidebarMenuButton class="p-1!">
                                            <p-avatar label="JD" shape="circle" class="size-6 shrink-0 text-xs" />
                                            <span>John Doe</span>
                                        </button>
                                    </p-sidebar-menu-item>
                                </p-sidebar-menu>
                            </p-sidebar-footer>
                            <button pSidebarRail></button>
                        </p-sidebar-panel>
                    </p-sidebar-aside>
                </p-sidebar>
                <p-sidebar-main>
                    <header class="flex h-12 items-center gap-2 border-b border-surface-200 dark:border-surface-700 px-4">
                        <button pButton pSidebarTrigger target="preview" severity="secondary" text size="small">
                            <svg data-p-icon="sidebar"></svg>
                        </button>
                    </header>
                    <div class="flex-1 p-4 flex flex-col gap-4">
                        <div class="rounded-lg bg-surface-100 dark:bg-surface-800 h-48"></div>
                        <div class="rounded-lg bg-surface-100 dark:bg-surface-800 flex-1"></div>
                    </div>
                </p-sidebar-main>
            </p-sidebar-layout>
        </div>
    `,
    standalone: true,
    imports: [AvatarModule, SidebarModule, ButtonModule, Plus, ChevronDown, EllipsisV, Sidebar, PIcon]
})
export class SidebarPreviewDemo implements OnInit, OnDestroy {
    isMobile = signal(false);

    open = signal(true);

    private mql?: MediaQueryList;

    private mqlListener?: (e: MediaQueryListEvent) => void;

    navGroups: NavGroup[] = [
        {
            label: 'Navigation',
            items: [
                { icon: 'home', label: 'Home', isActive: true },
                { icon: 'inbox', label: 'Inbox', badge: '12' },
                { icon: 'search', label: 'Search' },
                { icon: 'bell', label: 'Notifications', badge: '3' }
            ]
        },
        {
            label: 'Projects',
            action: true,
            items: [
                { icon: 'chart-bar', label: 'Analytics', subItems: [{ label: 'Overview', isActive: true }, { label: 'Reports' }, { label: 'Real-time' }] },
                { icon: 'users', label: 'Team' },
                { icon: 'calendar', label: 'Calendar' },
                { icon: 'folder', label: 'Documents', subItems: [{ label: 'Shared' }, { label: 'Private' }, { label: 'Archived' }] }
            ]
        },
        {
            label: 'Billing',
            items: [
                { icon: 'credit-card', label: 'Payments' },
                { icon: 'shopping-cart', label: 'Orders' },
                { icon: 'star', label: 'Subscriptions' }
            ]
        }
    ];

    ngOnInit() {
        if (typeof window === 'undefined') return;
        this.mql = window.matchMedia('(max-width: 1023px)');
        this.isMobile.set(this.mql.matches);
        this.open.set(!this.mql.matches);
        this.mqlListener = (e) => {
            this.isMobile.set(e.matches);
            this.open.set(!e.matches);
        };
        this.mql.addEventListener('change', this.mqlListener);
    }

    ngOnDestroy() {
        if (this.mql && this.mqlListener) {
            this.mql.removeEventListener('change', this.mqlListener);
        }
    }

    hasActiveSub(item: NavItem): boolean {
        return !!item.subItems?.some((s) => s.isActive);
    }
}
