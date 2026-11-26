import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SignupForm, User } from '../../models/user';
import { UserApi } from '../../services/user-api';
import { PasswordMatch } from '../../shared/password-match';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink, PasswordMatch, DatePipe],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
  // Stratégie par défaut conservée volontairement : le modèle `user` est muté en place par
  // `ngModel` et lu par un getter (`initials`) et par `validCount(form)`, dont le résultat change
  // quand les contrôles s'enregistrent de façon asynchrone. OnPush risquerait d'afficher une carte
  // membre ou une progression périmées, sans gain notable sur un écran aussi court.
})
export class Signup {
  private readonly userApi = inject(UserApi);
  private readonly destroyRef = inject(DestroyRef);

  protected user: SignupForm = this.createEmptyUser();

  protected readonly registeredUser = signal<User | null>(null);
  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected showPassword = false;

  protected readonly steps = [1, 2, 3, 4, 5, 6];

  protected get initials(): string {
    const first = this.user.firstName?.trim().charAt(0) ?? '';
    const last = this.user.lastName?.trim().charAt(0) ?? '';
    return (first + last).toUpperCase() || '?';
  }

  protected validCount(form: NgForm): number {
    return Object.values(form.controls).filter((control) => control.valid).length;
  }

  protected togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  protected onSubmit(form: NgForm): void {
    if (this.submitting()) {
      return;
    }

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const { login, password, lastName, firstName, email } = this.user;
    this.submitting.set(true);
    this.serverError.set(null);

    this.userApi
      .create({ login, password, lastName, firstName, email })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          this.submitting.set(false);
          this.registeredUser.set(created);

          this.user = this.createEmptyUser();
          form.resetForm(this.user);
        },
        error: (error: Error) => {
          this.submitting.set(false);
          this.serverError.set(error.message);
        },
      });
  }

  protected restart(): void {
    this.registeredUser.set(null);
    this.serverError.set(null);
    this.showPassword = false;
  }

  private createEmptyUser(): SignupForm {
    return { login: '', password: '', confirmPassword: '', lastName: '', firstName: '', email: '' };
  }
}
