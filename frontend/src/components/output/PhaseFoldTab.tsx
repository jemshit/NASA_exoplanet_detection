import { useState } from 'react';
import { Switch } from '@heroui/react';
import type { AnalysisResult } from '../../types';
import { PhaseFoldChart, TimeSeriesChart } from '../PlotlyCharts';

interface PhaseFoldTabProps {
  plots?: AnalysisResult['plots'];
}

export function PhaseFoldTab({ plots }: PhaseFoldTabProps) {
  const [showResiduals, setShowResiduals] = useState(false);

  return (
    <div className="pt-4 space-y-4">
      {plots?.residuals && (
        <Switch isSelected={showResiduals} onValueChange={setShowResiduals}>
          Show residuals
        </Switch>
      )}
      <div className="bg-background dark:bg-dark-background rounded-lg p-6 border border-border dark:border-dark-border">
        {plots?.phaseFolded && plots.phaseFolded.length > 0 ? (
          <PhaseFoldChart
            phaseFolded={plots.phaseFolded[0]}
            residuals={showResiduals && plots.residuals ? plots.residuals[0] : undefined}
          />
        ) : plots?.timeseries && plots.timeseries.length > 0 ? (
          <TimeSeriesChart timeseries={plots.timeseries[0]} />
        ) : (
          <div className="h-64 flex items-center justify-center text-secondary-text dark:text-dark-secondary-text">
            No phase-fold or time series data available
          </div>
        )}
      </div>
    </div>
  );
}

