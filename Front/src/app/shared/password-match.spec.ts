import { FormControl } from '@angular/forms';
import { PasswordMatch } from './password-match';

describe('PasswordMatch', () => {
  let directive: PasswordMatch;

  beforeEach(() => {
    directive = new PasswordMatch();
    directive.appPasswordMatch = 'Secret123';
  });

  it('accepte une confirmation identique', () => {
    expect(directive.validate(new FormControl('Secret123'))).toBeNull();
  });

  it('rejette une confirmation différente', () => {
    expect(directive.validate(new FormControl('autre'))).toEqual({ passwordMismatch: true });
  });

  it('laisse `required` gérer le champ vide', () => {
    expect(directive.validate(new FormControl(''))).toBeNull();
  });
});
