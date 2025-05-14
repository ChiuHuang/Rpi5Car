import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MapService } from '../../services/map.service';
import { SettingsService } from '../../services/settings.service';
import { MapData, Point, PointType } from '../../models/map.model';
import { Settings } from '../../models/settings.model';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-draw-map',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="draw-container" [@fadeSlideIn]>
      <div class="draw-header">
        <h2 class="draw-title">Draw New Map</h2>
        <div class="map-name-container">
          <label class="map-name-label">Map Name</label>
          <input 
            type="text" 
            class="map-name-input" 
            [ngModel]="mapData?.name"
            (ngModelChange)="updateMapName($event)"
            placeholder="Map 1"
          >
        </div>
      </div>

      <div class="drawing-area-container">
        <div class="drawing-tools" [@toolsSlideIn]>
          <button 
            class="tool-button" 
            *ngFor="let tool of drawingTools; let i = index"
            [class.active]="currentTool === tool.type"
            (click)="selectTool(tool.type)"
            [@toolButtonFadeIn]="{value: '', params: {delay: i * 100}}"
          >
            <span class="material-symbols-outlined">{{ tool.icon }}</span>
            <span class="tool-name">{{ tool.name }}</span>
          </button>
        </div>

        <div class="canvas-container" [@canvasFadeIn]>
          <canvas #canvas 
            class="drawing-canvas"
            (mousedown)="onCanvasMouseDown($event)"
            (mousemove)="onCanvasMouseMove($event)"
            (mouseup)="onCanvasMouseUp()"
            (mouseleave)="onCanvasMouseLeave()"
          ></canvas>
        </div>
      </div>

      <div class="draw-actions" [@actionsSlideUp]>
        <button class="button button-secondary" (click)="clearCanvas()">
          Clear
        </button>
        <button class="button button-primary" (click)="saveMap()">
          Save Map
        </button>
      </div>
    </div>
  `,
  styles: [`
    .draw-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: var(--spacing-md);
    }

    .draw-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-md);
    }

    .draw-title {
      font-size: 20px;
      font-weight: 500;
      margin: 0;
    }

    .map-name-container {
      display: flex;
      flex-direction: column;
      min-width: 200px;
    }

    .map-name-label {
      font-size: 12px;
      color: var(--md-on-surface-variant);
      margin-bottom: var(--spacing-xs);
    }

    .map-name-input {
      padding: var(--spacing-sm);
      border: 1px solid var(--md-outline-variant);
      border-radius: 4px;
      background-color: var(--md-surface-container-low);
    }

    .drawing-area-container {
      display: flex;
      flex: 1;
      gap: var(--spacing-md);
      min-height: 0;
    }

    .drawing-tools {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      background-color: var(--md-surface-container);
      padding: var(--spacing-sm);
      border-radius: 12px;
      width: 100px;
    }

    .tool-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm);
      border: none;
      background-color: transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tool-button:hover {
      background-color: var(--md-surface-container-high);
    }

    .tool-button.active {
      background-color: var(--md-primary-container);
      color: var(--md-on-primary-container);
    }

    .tool-name {
      font-size: 12px;
      font-weight: 500;
    }

    .canvas-container {
      flex: 1;
      background-color: var(--md-surface-container-highest);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .drawing-canvas {
      background-color: var(--md-inverse-surface);
      cursor: crosshair;
    }

    .draw-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-md);
    }

    @media (max-width: 768px) {
      .drawing-area-container {
        flex-direction: column;
      }

      .drawing-tools {
        flex-direction: row;
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
      }

      .tool-button {
        flex-direction: row;
      }
    }
  `],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('toolsSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('400ms 200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('toolButtonFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('300ms {{delay}}ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('canvasFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('500ms 300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('actionsSlideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms 600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DrawMapComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  mapData: MapData | null = null;
  mapId: number | null = null;
  settings!: Settings;
  
  currentTool: PointType = PointType.PATH;
  isDrawing = false;
  lastPoint: { x: number, y: number } | null = null;
  
  drawingTools = [
    { name: 'Path', type: PointType.PATH, icon: 'route' },
    { name: 'Obstacle', type: PointType.OBSTACLE, icon: 'block' },
    { name: 'Marker', type: PointType.MARKER, icon: 'place' },
    { name: 'Start', type: PointType.START, icon: 'play_arrow' },
    { name: 'End', type: PointType.END, icon: 'stop' }
  ];
  
  private ctx!: CanvasRenderingContext2D;
  private canvasWidth = 0;
  private canvasHeight = 0;
  private destroy$ = new Subject<void>();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mapService: MapService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.settingsService.getSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.settings = settings;
        this.initCanvas();
      });
    
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.mapId = +id;
          const map = this.mapService.getMapById(this.mapId);
          if (map) {
            this.mapData = { ...map };
            this.mapService.setCurrentMap(this.mapData);
            this.drawPoints();
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.mapData = this.mapService.createMap('New Map');
          this.mapId = this.mapData.id;
          this.mapService.setCurrentMap(this.mapData);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateMapName(name: string): void {
    if (this.mapData) {
      this.mapData.name = name;
      this.mapService.updateMap(this.mapData);
    }
  }

  selectTool(tool: PointType): void {
    this.currentTool = tool;
  }

  onCanvasMouseDown(event: MouseEvent): void {
    if (!this.mapData) return;
    
    this.isDrawing = true;
    
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const gridX = Math.round(x / this.settings.gridSize) * this.settings.gridSize;
    const gridY = Math.round(y / this.settings.gridSize) * this.settings.gridSize;
    
    this.lastPoint = { x: gridX, y: gridY };
    
    const newPoint: Point = {
      x: gridX,
      y: gridY,
      type: this.currentTool
    };
    
    if (this.currentTool === PointType.START || this.currentTool === PointType.END) {
      this.mapData.points = this.mapData.points.filter(p => p.type !== this.currentTool);
    }
    
    this.mapData.points.push(newPoint);
    this.mapService.updateMap(this.mapData);
    
    this.drawPoints();
  }

  onCanvasMouseMove(event: MouseEvent): void {
    if (!this.isDrawing || !this.mapData || !this.lastPoint) return;
    
    if (this.currentTool !== PointType.PATH) return;
    
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const gridX = Math.round(x / this.settings.gridSize) * this.settings.gridSize;
    const gridY = Math.round(y / this.settings.gridSize) * this.settings.gridSize;
    
    if (gridX !== this.lastPoint.x || gridY !== this.lastPoint.y) {
      const newPoint: Point = {
        x: gridX,
        y: gridY,
        type: this.currentTool
      };
      
      this.mapData.points.push(newPoint);
      this.mapService.updateMap(this.mapData);
      
      this.lastPoint = { x: gridX, y: gridY };
      this.drawPoints();
    }
  }

  onCanvasMouseUp(): void {
    this.isDrawing = false;
    this.lastPoint = null;
  }

  onCanvasMouseLeave(): void {
    this.isDrawing = false;
    this.lastPoint = null;
  }

  clearCanvas(): void {
    if (!this.mapData || !this.mapId) return;
    
    this.mapData.points = [];
    this.mapService.updateMap(this.mapData);
    this.drawGrid();
  }

  saveMap(): void {
    if (this.mapData) {
      this.mapService.updateMap(this.mapData);
      this.router.navigate(['/']);
    }
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    this.canvasWidth = 800;
    this.canvasHeight = 600;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    
    this.drawGrid();
    
    if (this.mapData) {
      this.drawPoints();
    }
  }

  private drawGrid(): void {
    if (!this.ctx) return;
    
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    
    for (let x = 0; x <= this.canvasWidth; x += this.settings.gridSize) {
      for (let y = 0; y <= this.canvasHeight; y += this.settings.gridSize) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 1, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  private drawPoints(): void {
    if (!this.ctx || !this.mapData) return;
    
    this.drawGrid();
    
    this.mapData.points.forEach(point => {
      switch (point.type) {
        case PointType.PATH:
          this.ctx.fillStyle = '#FFFFFF';
          break;
        case PointType.OBSTACLE:
          this.ctx.fillStyle = '#B3261E';
          break;
        case PointType.MARKER:
          this.ctx.fillStyle = '#EADDFF';
          break;
        case PointType.START:
          this.ctx.fillStyle = '#00C853';
          break;
        case PointType.END:
          this.ctx.fillStyle = '#FFA000';
          break;
      }
      
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, this.settings.pointSize, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    
    let lastPathPoint: Point | null = null;
    
    this.mapData.points.forEach(point => {
      if (point.type === PointType.PATH) {
        if (lastPathPoint) {
          this.ctx.beginPath();
          this.ctx.moveTo(lastPathPoint.x, lastPathPoint.y);
          this.ctx.lineTo(point.x, point.y);
          this.ctx.stroke();
        }
        lastPathPoint = point;
      } else {
        lastPathPoint = null;
      }
    });
  }
}