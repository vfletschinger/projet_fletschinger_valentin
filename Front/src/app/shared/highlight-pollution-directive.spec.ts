import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HighlightPollutionDirective } from './highlight-pollution-directive';

@Component({
  imports: [HighlightPollutionDirective],
  template: `<span [appHighlightPollution]="dangerIndex()">niveau</span>`,
})
class Host {
  readonly dangerIndex = signal(0);
}

describe('HighlightPollutionDirective', () => {
  function render(dangerIndex: number) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.dangerIndex.set(dangerIndex);
    fixture.detectChanges();

    return { fixture, span: fixture.nativeElement.querySelector('span') as HTMLElement };
  }

  it.each([
    [10, '--level-low'],
    [35, '--level-moderate'],
    [80, '--level-high'],
    [150, '--level-danger'],
  ])("colore le fond de l'indice %i avec %s", (dangerIndex, token) => {
    const { span } = render(dangerIndex);

    expect(span.style.backgroundColor).toBe(`var(${token})`);
  });

  it("met à jour la couleur quand l'indice change", () => {
    const { fixture, span } = render(10);

    fixture.componentInstance.dangerIndex.set(120);
    fixture.detectChanges();

    expect(span.style.backgroundColor).toBe('var(--level-danger)');
    expect(span.style.color).toBe('rgb(255, 255, 255)');
  });
});
