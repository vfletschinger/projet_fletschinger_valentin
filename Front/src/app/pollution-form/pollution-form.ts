import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { POLLUTION_TYPES, Pollution, PollutionType } from '../models/pollution';
import { notInFuture } from '../shared/not-in-future';
import { PollutionRecap } from '../pollution-recap/pollution-recap';

@Component({
  selector: 'app-pollution-form',
  standalone: true,
  imports: [ReactiveFormsModule, PollutionRecap],
  templateUrl: './pollution-form.html',
  styleUrl: './pollution-form.css',
})
export class PollutionForm {
  protected readonly pollutionTypes = POLLUTION_TYPES;

  protected readonly form = new FormGroup({
    title: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    type: new FormControl<PollutionType | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    observedAt: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, notInFuture],
    }),
    place: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
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

  protected declaration: Pollution | null = null;

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.declaration = this.form.getRawValue();
  }

  protected restart(): void {
    this.declaration = null;
    this.form.reset();
  }
}
