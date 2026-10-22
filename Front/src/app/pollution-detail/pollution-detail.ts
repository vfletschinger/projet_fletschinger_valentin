import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Pollution } from '../models/pollution';
import { PollutionRecap } from '../pollution-recap/pollution-recap';
import { PollutionApi } from '../services/pollution-api';

@Component({
  selector: 'app-pollution-detail',
  standalone: true,
  imports: [RouterLink, PollutionRecap],
  templateUrl: './pollution-detail.html',
})
export class PollutionDetail implements OnInit {
  private readonly pollutionApi = inject(PollutionApi);
  private readonly router = inject(Router);

  /** Paramètre `:id` de la route, injecté grâce à `withComponentInputBinding()`. */
  @Input({ required: true }) id!: string;

  protected readonly pollution = signal<Pollution | null>(null);
  protected readonly serverError = signal<string | null>(null);

  ngOnInit(): void {
    this.pollutionApi.getById(this.id).subscribe({
      next: (pollution) => this.pollution.set(pollution),
      error: (error: Error) => this.serverError.set(error.message),
    });
  }

  protected remove(pollution: Pollution): void {
    if (!confirm(`Supprimer « ${pollution.title} » ?`)) {
      return;
    }

    this.pollutionApi.delete(pollution.id).subscribe({
      next: () => this.router.navigate(['/pollutions']),
      error: (error: Error) => this.serverError.set(error.message),
    });
  }
}
