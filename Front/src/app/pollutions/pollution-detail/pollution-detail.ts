import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { Pollution } from '../../models/pollution';
import { PollutionRecap } from '../pollution-recap/pollution-recap';
import { Confirmation } from '../../services/confirmation';
import { PollutionApi } from '../../services/pollution-api';

@Component({
  selector: 'app-pollution-detail',
  standalone: true,
  imports: [RouterLink, PollutionRecap],
  templateUrl: './pollution-detail.html',
  // La pollution chargée et l'erreur sont des signaux : la vue se rafraîchit d'elle-même.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionDetail implements OnInit {
  private readonly pollutionApi = inject(PollutionApi);
  private readonly router = inject(Router);
  private readonly confirmation = inject(Confirmation);
  private readonly destroyRef = inject(DestroyRef);

  /** Paramètre `:id` de la route, injecté grâce à `withComponentInputBinding()`. */
  @Input({ required: true }) id!: string;

  protected readonly pollution = signal<Pollution | null>(null);
  protected readonly serverError = signal<string | null>(null);

  ngOnInit(): void {
    this.pollutionApi
      .getById(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pollution) => this.pollution.set(pollution),
        error: (error: Error) => this.serverError.set(error.message),
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
        next: () => this.router.navigate(['/pollutions']),
        error: (error: Error) => this.serverError.set(error.message),
      });
  }
}
