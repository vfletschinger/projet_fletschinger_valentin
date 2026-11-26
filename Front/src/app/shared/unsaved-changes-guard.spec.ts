import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

import { Confirmation } from '../services/confirmation';
import { HasUnsavedChanges, unsavedChangesGuard } from './unsaved-changes-guard';

describe('unsavedChangesGuard', () => {
  let confirmation: Confirmation;

  const run = (dirty: boolean) =>
    TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(
        { hasUnsavedChanges: () => dirty } as HasUnsavedChanges,
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
        {} as RouterStateSnapshot,
      ),
    ) as Observable<boolean>;

  beforeEach(() => {
    confirmation = TestBed.inject(Confirmation);
  });

  it("laisse partir sans question quand rien n'a été saisi", async () => {
    const ask = vi.spyOn(confirmation, 'ask');

    expect(await firstValueFrom(run(false))).toBe(true);
    expect(ask).not.toHaveBeenCalled();
  });

  it('ouvre la boîte de confirmation quand une saisie serait perdue', () => {
    run(true).subscribe();

    expect(confirmation.pending()!.title).toBe('Quitter sans enregistrer ?');
  });

  it("retient l'utilisateur qui choisit de rester", async () => {
    const answer = firstValueFrom(run(true));

    confirmation.pending()!.respond(false);

    expect(await answer).toBe(false);
  });

  it("laisse partir l'utilisateur qui confirme", async () => {
    const answer = firstValueFrom(run(true));

    confirmation.pending()!.respond(true);

    expect(await answer).toBe(true);
  });
});
