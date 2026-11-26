import { TestBed } from '@angular/core/testing';

import { Confirmation } from './confirmation';

describe('Confirmation', () => {
  let confirmation: Confirmation;

  beforeEach(() => {
    confirmation = TestBed.inject(Confirmation);
  });

  it("n'affiche rien tant que personne ne s'abonne", () => {
    confirmation.ask({ title: 'Titre', message: 'Message' });

    expect(confirmation.pending()).toBeNull();
  });

  it('expose la demande avec des libellés par défaut', () => {
    confirmation.ask({ title: 'Titre', message: 'Message' }).subscribe();

    expect(confirmation.pending()).toMatchObject({
      title: 'Titre',
      message: 'Message',
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler',
      danger: false,
    });
  });

  it('émet la réponse, se termine et referme la demande', () => {
    const answers: boolean[] = [];
    let completed = false;
    confirmation
      .ask({ title: 'Titre', message: 'Message' })
      .subscribe({ next: (answer) => answers.push(answer), complete: () => (completed = true) });

    confirmation.pending()!.respond(true);

    expect(answers).toEqual([true]);
    expect(completed).toBe(true);
    expect(confirmation.pending()).toBeNull();
  });

  it('referme la demande quand on se désabonne avant la réponse', () => {
    const subscription = confirmation.ask({ title: 'Titre', message: 'Message' }).subscribe();

    subscription.unsubscribe();

    expect(confirmation.pending()).toBeNull();
  });

  it('annule une demande encore ouverte quand une nouvelle arrive', () => {
    const first: boolean[] = [];
    confirmation.ask({ title: 'Première', message: '…' }).subscribe((answer) => first.push(answer));

    confirmation.ask({ title: 'Seconde', message: '…' }).subscribe();

    expect(first).toEqual([false]);
    expect(confirmation.pending()!.title).toBe('Seconde');
  });
});
