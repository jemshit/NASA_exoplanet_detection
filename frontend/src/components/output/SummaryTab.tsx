import type { AnalysisResult } from '../../types';
import { VerdictCard } from './VerdictCard';
import { KPITiles } from './KPITiles';
import { ClassProbabilityBars } from './ClassProbabilityBars';
import { QualityChecks } from './QualityChecks';

interface SummaryTabProps {
  result: AnalysisResult;
}

export function SummaryTab({ result }: SummaryTabProps) {
  const { prediction, metrics, model, qc } = result;

  return (
    <div className="pt-4 space-y-6">
      {/* Top Section: Verdict + Metrics */}
      <VerdictCard prediction={prediction} model={model} />
      <KPITiles metrics={metrics} />

      {/* Divider */}
      <div className="border-t border-border dark:border-dark-border mb-6" />

      {/* Bottom Section: Probabilities + Quality Checks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Class Probabilities */}
        <ClassProbabilityBars probs={prediction.probs} />

        {/* Right: Quality Checks */}
        <QualityChecks metrics={metrics} qc={qc} />
      </div>
    </div>
  );
}

