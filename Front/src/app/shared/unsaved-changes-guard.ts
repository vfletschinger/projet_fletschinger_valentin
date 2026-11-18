import { CanDeactivateFn } from '@angular/router';

/** Contrat d'un écran qui peut contenir une saisie non enregistrée. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/** Demande confirmation avant de quitter un écran dont la saisie serait perdue. */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) =>
  !component.hasUnsavedChanges() ||
  confirm('Des modifications ne sont pas enregistrées. Quitter quand même cette page ?');
