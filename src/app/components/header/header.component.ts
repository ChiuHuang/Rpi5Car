import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, SettingsDialogComponent],
  template: `
    <header class="header">
      <div class="header-left">
        <button class="icon-button" *ngIf="showBackButton" (click)="navigateBack()">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="header-title">{{ pageTitle }}</h1>
      </div>
      <div class="header-actions">
        <button class="icon-button" (click)="toggleSettings()">
          <span class="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>

    <app-settings-dialog 
      *ngIf="settingsOpen" 
      (close)="toggleSettings()"
    ></app-settings-dialog>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      background-color: var(--md-surface);
      border-bottom: 1px solid var(--md-outline-variant);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .header-title {
      font-size: 20px;
      font-weight: 500;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  `]
})
export class HeaderComponent {
  settingsOpen = false;

  constructor(private router: Router) {}

  get pageTitle(): string {
    const url = this.router.url;
    if (url.includes('/draw')) {
      return 'Draw Map';
    }
    return 'Raspberry Pi Map Drawer';
  }

  get showBackButton(): boolean {
    return this.router.url !== '/';
  }

  navigateBack(): void {
    this.router.navigate(['/']);
  }

  toggleSettings(): void {
    this.settingsOpen = !this.settingsOpen;
  }
}