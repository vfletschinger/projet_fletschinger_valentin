import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Signup } from './signup';

describe('Signup', () => {
  let fixture: ComponentFixture<Signup>;
  let el: HTMLElement;

  const submitButton = () => el.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  async function fill(id: string, value: string): Promise<void> {
    const input = el.querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function fillAll(confirm = 'Secret123'): Promise<void> {
    await fill('lastName', 'Dupont');
    await fill('firstName', 'Marie');
    await fill('email', 'marie@exemple.fr');
    await fill('login', 'mdupont');
    await fill('password', 'Secret123');
    await fill('confirmPassword', confirm);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signup],
    }).compileComponents();

    fixture = TestBed.createComponent(Signup);
    el = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('verrouille la soumission tant que le formulaire est vide', () => {
    expect(submitButton().disabled).toBe(true);
  });

  it('reste verrouillé si les mots de passe diffèrent', async () => {
    await fillAll('Different1');
    expect(submitButton().disabled).toBe(true);
    expect(el.textContent).toContain('Les mots de passe ne correspondent pas.');
  });

  it('déverrouille puis affiche le récapitulatif quand tout est valide', async () => {
    await fillAll();
    expect(submitButton().disabled).toBe(false);

    submitButton().click();
    fixture.detectChanges();

    expect(el.textContent).toContain('Bienvenue, Marie');
    expect(el.textContent).not.toContain('Secret123');
  });
});
