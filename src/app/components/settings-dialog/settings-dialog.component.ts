import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { Settings } from '../../models/settings.model';

@Component({
  selector: 'app-settings-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="dialog-overlay fade-in" (click)="onOverlayClick($event)">
      <div class="dialog slide-up">
        <div class="dialog-header">
          <h2 class="dialog-title">Settings</h2>
          <button class="icon-button" (click)="close.emit()">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="dialog-content">
          <form [formGroup]="settingsForm">
            <div class="input-field">
              <label class="input-label" for="serverUrl">Server URL</label>
              <input 
                id="serverUrl" 
                type="text" 
                class="input" 
                [class.error]="isFieldInvalid('serverUrl')"
                formControlName="serverUrl" 
                placeholder="http://localhost:3000"
              >
              <span class="error-text" *ngIf="isFieldInvalid('serverUrl')">
                Please enter a valid URL
              </span>
            </div>
            <div class="input-field">
              <label class="input-label" for="gridSize">Grid Size</label>
              <input 
                id="gridSize" 
                type="number" 
                class="input" 
                formControlName="gridSize" 
                min="10" 
                max="50"
              >
            </div>
            <div class="input-field">
              <label class="input-label" for="pointSize">Point Size</label>
              <input 
                id="pointSize" 
                type="number" 
                class="input" 
                formControlName="pointSize" 
                min="1" 
                max="10"
              >
            </div>
          </form>
        </div>
        <div class="dialog-actions">
          <button class="button button-secondary" (click)="close.emit()">
            Cancel
          </button>
          <button 
            class="button button-primary" 
            [disabled]="settingsForm.invalid"
            (click)="saveSettings()"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SettingsDialogComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  settingsForm!: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.close.emit();
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.settingsForm.get(field);
    return (control?.invalid && control?.touched) || false;
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      this.settingsService.updateSettings(this.settingsForm.value);
      this.close.emit();
    } else {
      this.markFormGroupTouched(this.settingsForm);
    }
  }

  private initForm(): void {
    this.settingsForm = this.fb.group({
      serverUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      gridSize: [20, [Validators.required, Validators.min(10), Validators.max(50)]],
      pointSize: [5, [Validators.required, Validators.min(1), Validators.max(10)]]
    });
  }

  private loadSettings(): void {
    this.settingsService.getSettings().subscribe((settings: Settings) => {
      this.settingsForm.patchValue(settings);
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}