import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapData } from '../../../models/map.model';

@Component({
  selector: 'app-map-list-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-list-item" [class.selected]="map.selected" (click)="onSelect()">
      <div class="map-index">{{ index }}</div>
      <div class="map-info">
        <div class="map-name">{{ map.name }}</div>
        <div class="map-meta">Last updated: {{ map.updatedAt | date:'short' }}</div>
      </div>
      <div class="map-actions">
        <div class="checkbox" (click)="onToggle($event)">
          <span class="material-symbols-outlined" *ngIf="map.selected">check</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-list-item {
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      background-color: var(--md-surface-container);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .map-list-item:hover {
      background-color: var(--md-surface-container-high);
      transform: translateY(-2px);
      box-shadow: var(--md-elevation-level1);
    }

    .map-list-item.selected {
      background-color: var(--md-primary-container);
    }

    .map-index {
      width: 36px;
      height: 36px;
      background-color: var(--md-secondary-container);
      color: var(--md-on-secondary-container);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      margin-right: var(--spacing-md);
      flex-shrink: 0;
    }

    .map-info {
      flex: 1;
    }

    .map-name {
      font-weight: 500;
      margin-bottom: var(--spacing-xs);
    }

    .map-meta {
      font-size: 12px;
      color: var(--md-on-surface-variant);
    }

    .map-actions {
      display: flex;
      align-items: center;
    }

    .checkbox {
      width: 24px;
      height: 24px;
      border: 2px solid var(--md-outline);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .map-list-item.selected .checkbox {
      background-color: var(--md-primary);
      border-color: var(--md-primary);
    }

    .checkbox span {
      color: var(--md-on-primary);
      font-size: 18px;
    }
  `]
})
export class MapListItemComponent {
  @Input() map!: MapData;
  @Input() index!: number;
  @Output() toggle = new EventEmitter<number>();
  @Output() select = new EventEmitter<number>();

  onToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.toggle.emit(this.map.id);
  }

  onSelect(): void {
    this.select.emit(this.map.id);
  }
}