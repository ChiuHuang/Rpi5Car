import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MapService } from '../../services/map.service';
import { MapData } from '../../models/map.model';
import { MapListItemComponent } from './map-list-item/map-list-item.component';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MapListItemComponent, DragDropModule],
  template: `
    <div class="container home-container" [@fadeIn]>
      <div class="maps-container" *ngIf="maps.length > 0" [@listContainer]>
        <div class="map-list" cdkDropList (cdkDropListDropped)="onDrop($event)">
          <app-map-list-item
            *ngFor="let map of maps; let i = index"
            [map]="map"
            [index]="i"
            cdkDrag
            [cdkDragData]="map"
            (toggle)="toggleMapSelection($event)"
            (select)="navigateToMap($event)"
            [@listItem]="{value: '', params: {delay: i * 100}}"
            class="map-item-animate"
          >
            <div class="drag-placeholder" *cdkDragPlaceholder></div>
          </app-map-list-item>
        </div>
      </div>

      <div class="empty-state" *ngIf="maps.length === 0" [@emptyState]>
        <div class="empty-state-content">
          <span class="material-symbols-outlined empty-icon">map</span>
          <h2>No maps available</h2>
          <p>Create your first map by clicking the button below</p>
        </div>
      </div>

      <button class="fab" (click)="createNewMap()" [@fabButton]>
        <span class="material-symbols-outlined">add</span>
      </button>
    </div>
  `,
  styles: [`
    .home-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }

    .maps-container {
      flex: 1;
      overflow: auto;
    }

    .map-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .empty-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-state-content {
      text-align: center;
      padding: var(--spacing-xl);
    }

    .empty-icon {
      font-size: 64px;
      color: var(--md-outline);
      margin-bottom: var(--spacing-md);
    }

    .map-item-animate {
      transition: transform 0.2s ease;
    }

    .drag-placeholder {
      background: var(--md-surface-container-highest);
      border: 2px dashed var(--md-outline);
      border-radius: 12px;
      min-height: 72px;
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drag-preview {
      box-shadow: var(--md-elevation-level3);
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .map-list.cdk-drop-list-dragging .map-item-animate:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .fab {
      position: fixed;
      right: var(--spacing-lg);
      bottom: var(--spacing-lg);
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: var(--md-primary);
      color: var(--md-on-primary);
      border: none;
      box-shadow: var(--md-elevation-level2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .fab:hover {
      transform: translateY(-2px);
      box-shadow: var(--md-elevation-level3);
      background-color: var(--md-primary);
    }

    .fab:active {
      transform: translateY(0);
      box-shadow: var(--md-elevation-level1);
    }

    .fab .material-symbols-outlined {
      font-size: 24px;
    }

    @media (max-width: 768px) {
      .fab {
        right: var(--spacing-md);
        bottom: var(--spacing-md);
      }
    }
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('listContainer', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('listItem', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('400ms {{delay}}ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('emptyState', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('fabButton', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0) translateY(40px)' }),
        animate('400ms 300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  maps: MapData[] = [];

  constructor(
    private mapService: MapService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.mapService.getMaps().subscribe(maps => {
      this.maps = maps;
    });
  }

  createNewMap(): void {
    const newMap = this.mapService.createMap(`Map ${this.maps.length + 1}`);
    this.navigateToMap(newMap.id);
  }

  toggleMapSelection(id: number): void {
    this.mapService.toggleMapSelection(id);
  }

  navigateToMap(id: number): void {
    this.router.navigate(['/draw', id]);
  }

  onDrop(event: CdkDragDrop<MapData[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.maps, event.previousIndex, event.currentIndex);
      this.mapService.reorderMaps(this.maps);
    }
  }
}