import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Input,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { switchMap } from 'rxjs';
import { UserApi } from '../../services/user-api';
import { notBlank } from '../../shared/not-blank';
// Alias : l'action porte le même nom que ce composant.
import { Login as LoginAction } from '../../store/auth/auth.actions';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  // État en signaux, formulaire réactif piloté par les événements du template : OnPush suffit.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly userApi = inject(UserApi);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Page demandée avant la redirection par `authGuard`, lue dans `?returnUrl=`. */
  @Input() returnUrl?: string;

  protected readonly form = new FormGroup({
    login: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, notBlank],
    }),
    password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly controls = this.form.controls;

  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected onSubmit(): void {
    if (this.submitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.serverError.set(null);

    // L'API (mockée) vérifie les identifiants ; le profil renvoyé est ensuite confié au store.
    this.userApi
      .login(this.form.getRawValue())
      .pipe(
        switchMap((user) =>
          this.store.dispatch(
            new LoginAction({ email: user.email, nom: `${user.firstName} ${user.lastName}` }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.router.navigateByUrl(this.returnUrl ?? '/pollutions'),
        error: (error: Error) => {
          this.submitting.set(false);
          this.serverError.set(error.message);
        },
      });
  }
}
