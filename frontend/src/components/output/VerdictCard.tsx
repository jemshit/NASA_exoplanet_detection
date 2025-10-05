import { Chip } from '@heroui/react';
import type { AnalysisResult } from '../../types';

interface VerdictCardProps {
  prediction: AnalysisResult['prediction'];
  model: AnalysisResult['model'];
}

export function VerdictCard({ prediction, model }: VerdictCardProps) {
  const maxProb = prediction.probs[prediction.label];

  return (
    <div className="space-y-3">
      Prediction:
      <Chip
        color={
          prediction.label === 'CONFIRMED'
            ? 'success'
            : prediction.label === 'CANDIDATE'
            ? 'warning'
            : 'danger'
        }
        size="md"
        variant="flat"
        className="ml-2"
      >
        {prediction.label}
      </Chip>

      {/* Confidence bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-secondary-text dark:text-dark-secondary-text">
          <span>Confidence</span>
          <span>{(maxProb * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-border dark:bg-dark-border rounded-full h-3">
          <div
            className="bg-accent dark:bg-dark-accent h-3 rounded-full transition-all"
            style={{ width: `${maxProb * 100}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-secondary-text dark:text-dark-secondary-text">
        Model: {model.name} v{model.version}
      </p>
    </div>
  );
}

