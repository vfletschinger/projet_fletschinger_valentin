import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Refuse une saisie faite uniquement d'espaces, que `Validators.required` laisse passer. */
export function notBlank(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;

  if (!value) {
    return null; // champ vide : c'est à `required` de le signaler.
  }

  return value.trim() ? null : { blank: true };
}
