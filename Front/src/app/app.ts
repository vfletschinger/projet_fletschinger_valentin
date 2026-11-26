import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngxs/store';
import { ConfirmDialog } from './shared/confirm-dialog/confirm-dialog';
import { Logout } from './store/auth/auth.actions';
import { AuthState } from './store/auth/auth.state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
  // La barre de navigation ne dépend que de signaux issus du store : inutile de la revérifier à chaque cycle.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  /** Signaux branchés sur les sélecteurs : ils se mettent à jour à chaque changement de l'état `auth`. */
  protected readonly isAuthenticated = this.store.selectSignal(AuthState.isAuthenticated);
  protected readonly username = this.store.selectSignal(AuthState.username);

  protected logout(): void {
    this.store.dispatch(new Logout());
    this.router.navigate(['/pollutions']);
  }
}
