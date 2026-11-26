import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { POLLUTION_TYPES, PollutionRequest, PollutionType } from '../../models/pollution';
import { PollutionApi } from '../../services/pollution-api';
import { HighlightPollutionDirective } from '../../shared/highlight-pollution-directive';
import { notBlank } from '../../shared/not-blank';
import { notInFuture } from '../../shared/not-in-future';
import { PollutionLevelPipe } from '../../shared/pollution-level-pipe';
import { HasUnsavedChanges } from '../../shared/unsaved-changes-guard';

@Component({
  selector: 'app-pollution-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PollutionLevelPipe, HighlightPollutionDirective],
  templateUrl: './pollution-form.html',
  // La saisie déclenche des événements du template, qui marquent la vue à rafraîchir, et l'état
  // des contrôles (`valid`, `touched`…) est porté par des signaux depuis Angular 20. Seul le
  // pré-remplissage asynchrone, hors événement, mérite un `markForCheck()` explicite.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionForm implements OnInit, HasUnsavedChanges {
  private readonly pollutionApi = inject(PollutionApi);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

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
    dangerIndex: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.pattern(/^\d+$/),
    ]),
  });

  protected readonly controls = this.form.controls;

  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.id) {
      return;
    }

    this.pollutionApi
      .getById(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pollution) => {
          this.form.patchValue(pollution);
          // La *valeur* d'un contrôle n'est pas un signal : on signale nous-mêmes que la vue
          // (aperçu du niveau de l'indice chargé) doit être revérifiée.
          this.cdr.markForCheck();
        },
        error: (error: Error) => this.serverError.set(error.message),
      });
  }

  /** Consulté par `unsavedChangesGuard` avant de quitter l'écran. */
  hasUnsavedChanges(): boolean {
    return this.form.dirty;
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

    const { dangerIndex, ...fields } = this.form.getRawValue();
    // `Validators.required` garantit qu'un formulaire valide a un indice renseigné.
    const draft: PollutionRequest = { ...fields, dangerIndex: dangerIndex! };
    const request = this.id
      ? this.pollutionApi.update(this.id, draft)
      : this.pollutionApi.create(draft);

    this.submitting.set(true);
    this.serverError.set(null);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (saved) => {
        // La saisie est enregistrée : le guard ne doit plus demander confirmation.
        this.form.markAsPristine();
        this.router.navigate(['/pollutions', saved.id]);
      },
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
