import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  viewChild,
} from '@angular/core';
import { Confirmation } from '../../services/confirmation';

/**
 * Boîte de confirmation de l'application, affichée par le service `Confirmation`.
 *
 * Repose sur l'élément natif `<dialog>` ouvert par `showModal()` : le navigateur gère le fond
 * assombri, le piège à focus, la touche Échap et la restitution du focus à la fermeture.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  // Tout l'affichage dépend du signal `pending` du service.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  protected readonly confirmation = inject(Confirmation);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // Synchronise l'ouverture du <dialog> avec la demande en cours, une fois son contenu rendu
    // (le bouton `autofocus` doit exister au moment de `showModal()`).
    afterRenderEffect(() => {
      const dialog = this.dialog().nativeElement;
      const pending = this.confirmation.pending();

      if (pending && !dialog.open) {
        dialog.showModal();
      } else if (!pending && dialog.open) {
        dialog.close();
      }
    });
  }

  protected answer(confirmed: boolean): void {
    this.confirmation.pending()?.respond(confirmed);
  }

  /** Échap : on garde la main sur la fermeture pour répondre « non » au service. */
  protected onCancel(event: Event): void {
    event.preventDefault();
    this.answer(false);
  }

  /** Un clic sur le fond (hors du panneau) vaut annulation. */
  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.answer(false);
    }
  }
}
