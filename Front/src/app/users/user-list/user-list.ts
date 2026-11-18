import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../models/user';
import { Auth } from '../../services/auth';
import { UserApi } from '../../services/user-api';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './user-list.html',
  // Liste, chargement et erreur sont des signaux mis à jour sans mutation : OnPush suffit.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserList implements OnInit {
  private readonly userApi = inject(UserApi);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(true);
  protected readonly serverError = signal<string | null>(null);

  ngOnInit(): void {
    this.userApi.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.serverError.set(error.message);
        this.loading.set(false);
      },
    });
  }

  protected remove(user: User): void {
    if (!confirm(`Supprimer le compte « ${user.login} » ?`)) {
      return;
    }

    this.userApi.delete(user.id).subscribe({
      next: () => {
        this.users.update((list) => list.filter(({ id }) => id !== user.id));
        // Un compte supprimé ne peut pas rester connecté, ni sur cet écran réservé aux connectés.
        if (this.auth.user()?.id === user.id) {
          this.auth.logout();
          this.router.navigate(['/pollutions']);
        }
      },
      error: (error: Error) => this.serverError.set(error.message),
    });
  }
}
