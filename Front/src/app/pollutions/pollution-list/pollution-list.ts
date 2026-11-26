import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { POLLUTION_TYPES, Pollution, PollutionType } from '../../models/pollution';
import { Confirmation } from '../../services/confirmation';
import { PollutionApi } from '../../services/pollution-api';
import { HighlightPollutionDirective } from '../../shared/highlight-pollution-directive';
import { PollutionLevelPipe } from '../../shared/pollution-level-pipe';

@Component({
  selector: 'app-pollution-list',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, PollutionLevelPipe, HighlightPollutionDirective],
  templateUrl: './pollution-list.html',
  styleUrl: './pollution-list.css',
  // Tout l'état passe par des signaux, mis à jour sans mutation : OnPush suffit.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionList implements OnInit {
  private readonly pollutionApi = inject(PollutionApi);
  private readonly confirmation = inject(Confirmation);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pollutionTypes = POLLUTION_TYPES;

  protected readonly pollutions = signal<Pollution[]>([]);
  protected readonly loading = signal(true);
  protected readonly serverError = signal<string | null>(null);

  protected readonly search = signal('');
  protected readonly type = signal<PollutionType | ''>('');
  protected readonly since = signal('');

  protected readonly filteredPollutions = computed(() => {
    const search = this.search().trim().toLowerCase();
    const type = this.type();
    const since = this.since();

    return this.pollutions().filter(
      (pollution) =>
        (!search || `${pollution.title} ${pollution.place}`.toLowerCase().includes(search)) &&
        (!type || pollution.type === type) &&
        (!since || pollution.observedAt >= since),
    );
  });

  ngOnInit(): void {
    this.pollutionApi
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pollutions) => {
          this.pollutions.set(pollutions);
          this.loading.set(false);
        },
        error: (error: Error) => {
          this.serverError.set(error.message);
          this.loading.set(false);
        },
      });
  }

  protected remove(pollution: Pollution): void {
    this.confirmation
      .ask({
        title: 'Supprimer cette pollution ?',
        message: `« ${pollution.title} » sera définitivement supprimée.`,
        confirmLabel: 'Supprimer',
        danger: true,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.pollutionApi.delete(pollution.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.pollutions.update((list) => list.filter(({ id }) => id !== pollution.id)),
        error: (error: Error) => this.serverError.set(error.message),
      });
  }

  protected resetFilters(): void {
    this.search.set('');
    this.type.set('');
    this.since.set('');
  }
}
