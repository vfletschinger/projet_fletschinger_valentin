import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { User } from '../../models/user';
import { Auth } from '../../services/auth';
import { Confirmation } from '../../services/confirmation';
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
  private readonly confirmation = inject(Confirmation);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(true);
  protected readonly serverError = signal<string | null>(null);

  ngOnInit(): void {
    this.userApi
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
    this.confirmation
      .ask({
        title: 'Supprimer ce compte ?',
        message: `Le compte « ${user.login} » (${user.firstName} ${user.lastName}) sera définitivement supprimé.`,
        confirmLabel: 'Supprimer le compte',
        danger: true,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.userApi.delete(user.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
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
