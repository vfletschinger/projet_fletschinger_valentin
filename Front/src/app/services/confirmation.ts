import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

/** Contenu d'une demande de confirmation. */
export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Action destructrice (suppression…) : le bouton de confirmation passe en rouge. */
  danger?: boolean;
}

export interface PendingConfirmation extends Required<ConfirmOptions> {
  readonly respond: (confirmed: boolean) => void;
}

/**
 * Remplace `window.confirm()` par la boîte de dialogue de l'application (`ConfirmDialog`,
 * placée une seule fois dans `App`). `ask()` renvoie un Observable qui émet la réponse puis se
 * termine ; se désabonner avant la réponse referme la boîte, comme si l'utilisateur avait annulé.
 */
@Injectable({ providedIn: 'root' })
export class Confirmation {
  private readonly current = signal<PendingConfirmation | null>(null);

  /** Demande affichée en ce moment, lue par `ConfirmDialog`. */
  readonly pending = this.current.asReadonly();

  ask(options: ConfirmOptions): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      // Une seule boîte à la fois : une demande encore ouverte est considérée comme annulée.
      this.current()?.respond(false);

      const request: PendingConfirmation = {
        confirmLabel: 'Confirmer',
        cancelLabel: 'Annuler',
        danger: false,
        ...options,
        respond: (confirmed) => {
          if (this.current() === request) {
            this.current.set(null);
          }
          subscriber.next(confirmed);
          subscriber.complete();
        },
      };

      this.current.set(request);

      // Désabonnement (écran détruit, navigation annulée…) : on referme la boîte.
      return () => {
        if (this.current() === request) {
          this.current.set(null);
        }
      };
    });
  }
}
