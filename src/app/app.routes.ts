import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'draw',
    loadComponent: () => import('./pages/draw-map/draw-map.component').then(m => m.DrawMapComponent)
  },
  {
    path: 'draw/:id',
    loadComponent: () => import('./pages/draw-map/draw-map.component').then(m => m.DrawMapComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];