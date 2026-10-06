import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../models/user';
import { PasswordMatch } from '../shared/password-match';

type RegisteredUser = Omit<User, 'password' | 'confirmPassword'>;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, PasswordMatch],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  protected user: User = this.createEmptyUser();

  protected registeredUser: RegisteredUser | null = null;
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
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const { login, lastName, firstName, email } = this.user;
    this.registeredUser = { login, lastName, firstName, email };

    this.user = this.createEmptyUser();
    form.resetForm(this.user);
  }

  protected restart(): void {
    this.registeredUser = null;
    this.showPassword = false;
  }

  private createEmptyUser(): User {
    return { login: '', password: '', confirmPassword: '', lastName: '', firstName: '', email: '' };
  }
}
