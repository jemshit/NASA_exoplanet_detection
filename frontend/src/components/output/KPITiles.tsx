import type { AnalysisResult } from '../../types';

interface KPITilesProps {
  metrics: AnalysisResult['metrics'];
}

export function KPITiles({ metrics }: KPITilesProps) {
  const kpis = [
    { label: 'Period', value: metrics.periodDays, unit: 'days', show: true },
    { label: 'Depth', value: metrics.depthPpm, unit: 'ppm', show: true },
    { label: 'Duration', value: metrics.durationHr, unit: 'hr', show: true },
    { label: 'SNR', value: metrics.snr, unit: '', show: true },
    { label: 'Radius', value: metrics.radiusRe, unit: 'R⊕', show: metrics.radiusRe !== undefined },
    { label: 'Odd/Even Δ', value: metrics.oddEvenDelta, unit: '', show: metrics.oddEvenDelta !== undefined },
  ].filter((kpi) => kpi.show);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-background dark:bg-dark-background p-3 rounded-lg border border-border dark:border-dark-border"
        >
          <p className="text-xs text-secondary-text dark:text-dark-secondary-text mb-1">
            {kpi.label}
          </p>
          <p className="text-lg font-semibold text-primary-text dark:text-dark-primary-text">
            {typeof kpi.value === 'number' ? kpi.value.toFixed(kpi.unit === 'ppm' ? 0 : 2) : kpi.value}{' '}
            <span className="text-sm font-normal text-secondary-text dark:text-dark-secondary-text">
              {kpi.unit}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}

