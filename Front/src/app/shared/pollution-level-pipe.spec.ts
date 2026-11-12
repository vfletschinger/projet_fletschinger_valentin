import { PollutionLevelPipe } from './pollution-level-pipe';

describe('PollutionLevelPipe', () => {
  const pipe = new PollutionLevelPipe();

  it.each([
    [0, 'Faible'],
    [20, 'Faible'],
    [21, 'Modérée'],
    [50, 'Modérée'],
    [51, 'Élevée'],
    [100, 'Élevée'],
    [101, 'Dangereuse'],
    [500, 'Dangereuse'],
  ])("classe l'indice %i en « %s »", (dangerIndex, level) => {
    expect(pipe.transform(dangerIndex)).toBe(level);
  });

  it("ajoute l'indice au format détaillé", () => {
    expect(pipe.transform(75, 'detailed')).toBe('Élevée (indice 75)');
  });

  it("n'affiche rien sans indice", () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
