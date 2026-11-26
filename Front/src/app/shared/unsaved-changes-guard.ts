import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { of } from 'rxjs';
import { Confirmation } from '../services/confirmation';

/** Contrat d'un écran qui peut contenir une saisie non enregistrée. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * Demande confirmation avant de quitter un écran dont la saisie serait perdue. Le routeur attend
 * la réponse de la boîte de dialogue (Observable) avant de poursuivre ou d'annuler la navigation.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) {
    return of(true);
  }

  return inject(Confirmation).ask({
    title: 'Quitter sans enregistrer ?',
    message: 'Vos modifications ne sont pas enregistrées et seront perdues.',
    confirmLabel: 'Quitter la page',
    cancelLabel: 'Rester',
    danger: true,
  });
};
