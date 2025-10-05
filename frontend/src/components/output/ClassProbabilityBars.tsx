import type { AnalysisResult } from '../../types';

interface ClassProbabilityBarsProps {
  probs: AnalysisResult['prediction']['probs'];
}

export function ClassProbabilityBars({ probs }: ClassProbabilityBarsProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-primary-text dark:text-dark-primary-text">
        Class Probabilities
      </h3>
      <div className="space-y-2">
        {(['CONFIRMED', 'CANDIDATE', 'FALSE_POSITIVE'] as const).map((label) => {
          const prob = probs[label];
          return (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-secondary-text dark:text-dark-secondary-text">{label}</span>
                <span className="text-primary-text dark:text-dark-primary-text font-medium">
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-border dark:bg-dark-border rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    label === 'CONFIRMED'
                      ? 'bg-green-500'
                      : label === 'CANDIDATE'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${prob * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

