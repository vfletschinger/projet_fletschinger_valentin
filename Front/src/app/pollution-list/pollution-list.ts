import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { POLLUTION_TYPES, Pollution, PollutionType } from '../models/pollution';
import { PollutionApi } from '../services/pollution-api';

@Component({
  selector: 'app-pollution-list',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './pollution-list.html',
  styleUrl: './pollution-list.css',
})
export class PollutionList implements OnInit {
  private readonly pollutionApi = inject(PollutionApi);

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
    this.pollutionApi.getAll().subscribe({
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
    if (!confirm(`Supprimer « ${pollution.title} » ?`)) {
      return;
    }

    this.pollutionApi.delete(pollution.id).subscribe({
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
