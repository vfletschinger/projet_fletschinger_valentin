import { Component, Input, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../services/auth';
import { notBlank } from '../shared/not-blank';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

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

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl ?? '/pollutions'),
      error: (error: Error) => {
        this.submitting.set(false);
        this.serverError.set(error.message);
      },
    });
  }
}
