import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../models/user';
import { SignupResponse } from '../models/signup';
import { SignupApi } from '../services/signup-api';
import { PasswordMatch } from '../shared/password-match';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, PasswordMatch, DatePipe],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  private readonly signupApi = inject(SignupApi);

  protected user: User = this.createEmptyUser();

  protected readonly registeredUser = signal<SignupResponse | null>(null);
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

    this.signupApi.signUp({ login, password, lastName, firstName, email }).subscribe({
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

  private createEmptyUser(): User {
    return { login: '', password: '', confirmPassword: '', lastName: '', firstName: '', email: '' };
  }
}
