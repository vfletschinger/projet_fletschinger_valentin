import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { HasUnsavedChanges, unsavedChangesGuard } from './unsaved-changes-guard';

describe('unsavedChangesGuard', () => {
  const run = (dirty: boolean) =>
    TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(
        { hasUnsavedChanges: () => dirty } as HasUnsavedChanges,
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
        {} as RouterStateSnapshot,
      ),
    );

  afterEach(() => vi.restoreAllMocks());

  it("laisse partir sans question quand rien n'a été saisi", () => {
    const confirm = vi.spyOn(window, 'confirm');

    expect(run(false)).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it("retient l'utilisateur qui annule la sortie", () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    expect(run(true)).toBe(false);
  });

  it("laisse partir l'utilisateur qui confirme", () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    expect(run(true)).toBe(true);
  });
});
