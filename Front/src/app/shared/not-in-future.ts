import { AbstractControl, ValidationErrors } from '@angular/forms';

export function notInFuture(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;

  if (!value) {
    return null;
  }

  const date = new Date(value);
  const today = new Date().toISOString().slice(0, 10);

  if (Number.isNaN(date.getTime())) {
    return { invalidDate: true };
  }

  return value <= today ? null : { futureDate: true };
}
