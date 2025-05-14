import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DEFAULT_SETTINGS, Settings } from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STORAGE_KEY = 'rpi5_map_drawer_settings';
  private settingsSubject = new BehaviorSubject<Settings>(DEFAULT_SETTINGS);

  constructor() {
    this.loadSettings();
  }

  getSettings(): Observable<Settings> {
    return this.settingsSubject.asObservable();
  }

  updateSettings(settings: Partial<Settings>): void {
    const currentSettings = this.settingsSubject.value;
    const updatedSettings = { ...currentSettings, ...settings };
    
    this.settingsSubject.next(updatedSettings);
    this.saveSettings(updatedSettings);
  }

  private loadSettings(): void {
    try {
      const storedSettings = localStorage.getItem(this.STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        this.settingsSubject.next({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  }

  private saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }
}