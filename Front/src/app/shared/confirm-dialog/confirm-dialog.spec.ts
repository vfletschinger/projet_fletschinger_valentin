import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Confirmation } from '../../services/confirmation';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  let fixture: ComponentFixture<ConfirmDialog>;
  let el: HTMLElement;
  let confirmation: Confirmation;
  let answers: boolean[];

  const dialog = () => el.querySelector('dialog')!;
  const buttons = () => [...el.querySelectorAll<HTMLButtonElement>('dialog button')];

  // jsdom n'implémente pas encore showModal()/close() : on reproduit leur effet sur `open`.
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.open = true;
    };
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.open = false;
    };
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmDialog] }).compileComponents();

    confirmation = TestBed.inject(Confirmation);
    fixture = TestBed.createComponent(ConfirmDialog);
    el = fixture.nativeElement;
    answers = [];
    await fixture.whenStable();
  });

  async function ask(danger = false): Promise<void> {
    confirmation
      .ask({
        title: 'Supprimer cette pollution ?',
        message: '« Bidons » sera définitivement supprimée.',
        confirmLabel: 'Supprimer',
        danger,
      })
      .subscribe((answer) => answers.push(answer));
    await fixture.whenStable();
  }

  it('reste fermée sans demande', () => {
    expect(dialog().open).toBe(false);
    expect(buttons()).toHaveLength(0);
  });

  it("s'ouvre avec le titre, le message et les libellés demandés", async () => {
    await ask();

    expect(dialog().open).toBe(true);
    expect(el.querySelector('h2')!.textContent).toBe('Supprimer cette pollution ?');
    expect(el.querySelector('.message')!.textContent).toContain('définitivement supprimée');
    expect(buttons().map((button) => button.textContent!.trim())).toEqual(['Annuler', 'Supprimer']);
  });

  it('met le bouton de confirmation en rouge pour une action destructrice', async () => {
    await ask(true);

    expect(buttons()[1].classList).toContain('btn-danger-solid');
  });

  it('répond oui et se referme au clic sur le bouton de confirmation', async () => {
    await ask();

    buttons()[1].click();
    await fixture.whenStable();

    expect(answers).toEqual([true]);
    expect(dialog().open).toBe(false);
  });

  it('répond non au clic sur « Annuler »', async () => {
    await ask();

    buttons()[0].click();
    await fixture.whenStable();

    expect(answers).toEqual([false]);
    expect(dialog().open).toBe(false);
  });

  it('répond non à la touche Échap', async () => {
    await ask();

    dialog().dispatchEvent(new Event('cancel', { cancelable: true }));
    await fixture.whenStable();

    expect(answers).toEqual([false]);
  });

  it('répond non au clic sur le fond', async () => {
    await ask();

    dialog().click();
    await fixture.whenStable();

    expect(answers).toEqual([false]);
  });

  it('ignore un clic dans le panneau', async () => {
    await ask();

    el.querySelector<HTMLElement>('.message')!.click();
    await fixture.whenStable();

    expect(answers).toEqual([]);
    expect(dialog().open).toBe(true);
  });
});
