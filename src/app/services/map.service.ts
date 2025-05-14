import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MapData, Point } from '../models/map.model';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private maps: MapData[] = [];
  private mapsSubject = new BehaviorSubject<MapData[]>([]);
  private currentMapSubject = new BehaviorSubject<MapData | null>(null);

  constructor() {
    this.loadMockData();
  }

  getMaps(): Observable<MapData[]> {
    return this.mapsSubject.asObservable();
  }

  getCurrentMap(): Observable<MapData | null> {
    return this.currentMapSubject.asObservable();
  }

  setCurrentMap(map: MapData | null): void {
    this.currentMapSubject.next(map);
  }

  getMapById(id: number): MapData | undefined {
    return this.maps.find(map => map.id === id);
  }

  createMap(name: string): MapData {
    const newId = this.maps.length > 0 
      ? Math.max(...this.maps.map(m => m.id)) + 1 
      : 1;
    
    const newMap: MapData = {
      id: newId,
      name,
      selected: false,
      points: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.maps.push(newMap);
    this.mapsSubject.next([...this.maps]);
    
    return newMap;
  }

  updateMap(map: MapData): void {
    const index = this.maps.findIndex(m => m.id === map.id);
    if (index !== -1) {
      map.updatedAt = new Date();
      this.maps[index] = { ...map };
      this.mapsSubject.next([...this.maps]);
      
      if (this.currentMapSubject.value?.id === map.id) {
        this.currentMapSubject.next({ ...map });
      }
    }
  }

  toggleMapSelection(id: number): void {
    const index = this.maps.findIndex(m => m.id === id);
    if (index !== -1) {
      this.maps[index] = {
        ...this.maps[index],
        selected: !this.maps[index].selected,
        updatedAt: new Date()
      };
      this.mapsSubject.next([...this.maps]);
    }
  }

  reorderMaps(maps: MapData[]): void {
    this.maps = [...maps];
    this.mapsSubject.next(this.maps);
  }

  deleteMap(id: number): void {
    this.maps = this.maps.filter(map => map.id !== id);
    this.mapsSubject.next([...this.maps]);
    
    if (this.currentMapSubject.value?.id === id) {
      this.currentMapSubject.next(null);
    }
  }

  addPointToMap(mapId: number, point: Point): void {
    const map = this.getMapById(mapId);
    if (map) {
      map.points.push(point);
      map.updatedAt = new Date();
      this.updateMap(map);
    }
  }

  clearPoints(mapId: number): void {
    const map = this.getMapById(mapId);
    if (map) {
      map.points = [];
      map.updatedAt = new Date();
      this.updateMap(map);
    }
  }

  private loadMockData(): void {
    this.maps = [
      {
        id: 1,
        name: 'Map 1',
        selected: true,
        points: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Map 2',
        selected: true,
        points: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Map 3',
        selected: true,
        points: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Map 4',
        selected: true,
        points: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: 'Map 5',
        selected: true,
        points: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.mapsSubject.next(this.maps);
  }
}