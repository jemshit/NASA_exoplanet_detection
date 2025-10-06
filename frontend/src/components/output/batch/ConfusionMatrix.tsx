import type { BatchAnalysisResult } from '../../../types';

interface ConfusionMatrixProps {
  confusionMatrix: BatchAnalysisResult['metrics']['confusion_matrix'];
}

const LABELS = ['FALSE POSITIVE', 'CANDIDATE', 'CONFIRMED'];

export function ConfusionMatrix({ confusionMatrix }: ConfusionMatrixProps) {
  const total = confusionMatrix.flat().reduce((a, b) => a + b, 0);

  const getColor = (value: number) => {
    const intensity = value / Math.max(...confusionMatrix.flat());
    if (intensity === 0) return 'bg-gray-50 dark:bg-gray-900';
    if (intensity < 0.3) return 'bg-blue-100 dark:bg-blue-900/30';
    if (intensity < 0.6) return 'bg-blue-300 dark:bg-blue-700/50';
    if (intensity < 0.9) return 'bg-blue-500 dark:bg-blue-600';
    return 'bg-blue-700 dark:bg-blue-500';
  };

  const getTextColor = (value: number) => {
    const intensity = value / Math.max(...confusionMatrix.flat());
    return intensity > 0.5 ? 'text-white' : 'text-gray-900 dark:text-gray-100';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text dark:text-dark-text">
          Confusion Matrix
        </h3>
        <div className="text-sm text-text-secondary dark:text-dark-text-secondary">
          Total: {total} predictions
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-4 gap-2">
            {/* Top-left empty cell */}
            <div className="flex items-center justify-center p-2">
              <div className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary text-center">
                Actual →<br/>Predicted ↓
              </div>
            </div>

            {/* Column headers (Actual) */}
            {LABELS.map((label) => (
              <div
                key={`header-${label}`}
                className="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-800 rounded"
              >
                <div className="text-xs font-semibold text-center text-text dark:text-dark-text">
                  {label}
                </div>
              </div>
            ))}

            {/* Matrix rows */}
            {confusionMatrix.map((row, i) => (
              <div key={`row-${i}`} className="contents">
                {/* Row header (Predicted) */}
                <div className="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="text-xs font-semibold text-center text-text dark:text-dark-text">
                    {LABELS[i]}
                  </div>
                </div>

                {/* Matrix cells */}
                {row.map((value, j) => (
                  <div
                    key={`cell-${i}-${j}`}
                    className={`flex flex-col items-center justify-center p-4 rounded transition-all hover:scale-105 ${getColor(value)}`}
                  >
                    <div className={`text-2xl font-bold ${getTextColor(value)}`}>
                      {value}
                    </div>
                    <div className={`text-xs ${getTextColor(value)} opacity-75`}>
                      {((value / total) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-xs text-text-secondary dark:text-dark-text-secondary text-center">
        Diagonal cells (darker) represent correct predictions
      </div>
    </div>
  );
}

