import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { POLLUTION_TYPES, PollutionType } from '../models/pollution';
import { PollutionApi } from '../services/pollution-api';
import { notBlank } from '../shared/not-blank';
import { notInFuture } from '../shared/not-in-future';

@Component({
  selector: 'app-pollution-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './pollution-form.html',
})
export class PollutionForm implements OnInit {
  private readonly pollutionApi = inject(PollutionApi);
  private readonly router = inject(Router);

  /** Paramètre `:id` de la route de modification ; absent en création. */
  @Input() id?: string;

  protected readonly pollutionTypes = POLLUTION_TYPES;

  protected readonly form = new FormGroup({
    title: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, notBlank],
    }),
    type: new FormControl<PollutionType | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, notBlank],
    }),
    observedAt: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, notInFuture],
    }),
    place: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, notBlank],
    }),
    latitude: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(-90),
      Validators.max(90),
    ]),
    longitude: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(-180),
      Validators.max(180),
    ]),
    photoUrl: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.pattern(/^https?:\/\/\S+$/)],
    }),
  });

  protected readonly controls = this.form.controls;

  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.id) {
      return;
    }

    this.pollutionApi.getById(this.id).subscribe({
      next: (pollution) => this.form.patchValue(pollution),
      error: (error: Error) => this.serverError.set(error.message),
    });
  }

  protected onSubmit(): void {
    if (this.submitting()) {
      return;
    }

    this.trimTextControls();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const draft = this.form.getRawValue();
    const request = this.id
      ? this.pollutionApi.update(this.id, draft)
      : this.pollutionApi.create(draft);

    this.submitting.set(true);
    this.serverError.set(null);

    request.subscribe({
      next: (saved) => this.router.navigate(['/pollutions', saved.id]),
      error: (error: Error) => {
        this.submitting.set(false);
        this.serverError.set(error.message);
      },
    });
  }

  /** Normalise la saisie avant validation : une valeur blanche devient vide, donc requise. */
  private trimTextControls(): void {
    const { title, description, place, photoUrl } = this.controls;

    for (const control of [title, description, place, photoUrl]) {
      control.setValue(control.value.trim());
    }
  }
}
