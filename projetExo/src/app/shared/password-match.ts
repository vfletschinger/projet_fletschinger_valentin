import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appPasswordMatch]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: PasswordMatch, multi: true }],
})

export class PasswordMatch implements Validator {
  private password = '';
  private onValidatorChange?: () => void;

  @Input()
  set appPasswordMatch(value: string) {
    this.password = value;

    this.onValidatorChange?.();
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const confirmation = control.value as string;

    if (!confirmation) {
      return null; 
    }

    return confirmation === this.password ? null : { passwordMismatch: true };
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }
}
