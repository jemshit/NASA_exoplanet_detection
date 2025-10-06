import { useMemo } from 'react';
import type { RowResult } from '../../../types';

interface TrueVsPredictedProps {
  rowResults: RowResult[];
}

export function TrueVsPredicted({ rowResults }: TrueVsPredictedProps) {
  const analysis = useMemo(() => {
    const classes = ['FALSE POSITIVE', 'CANDIDATE', 'CONFIRMED'];
    const matrix: Record<string, Record<string, number>> = {};
    
    classes.forEach(trueClass => {
      matrix[trueClass] = {};
      classes.forEach(predClass => {
        matrix[trueClass][predClass] = 0;
      });
    });

    rowResults.forEach(row => {
      if (matrix[row.true_label] && matrix[row.true_label][row.predicted_label] !== undefined) {
        matrix[row.true_label][row.predicted_label]++;
      }
    });

    const correct = rowResults.filter(r => r.predicted_label === r.true_label).length;
    const accuracy = (correct / rowResults.length) * 100;

    return { matrix, classes, correct, accuracy, total: rowResults.length };
  }, [rowResults]);

  const getPercentage = (value: number) => {
    return ((value / analysis.total) * 100).toFixed(1);
  };

  const getCellColor = (trueClass: string, predClass: string, value: number) => {
    if (value === 0) return 'bg-gray-50 dark:bg-gray-900';
    
    const isCorrect = trueClass === predClass;
    const intensity = value / Math.max(
      ...Object.values(analysis.matrix).flatMap(row => Object.values(row))
    );

    if (isCorrect) {
      // Green for correct predictions
      if (intensity < 0.3) return 'bg-green-100 dark:bg-green-900/30';
      if (intensity < 0.6) return 'bg-green-300 dark:bg-green-700/50';
      if (intensity < 0.9) return 'bg-green-500 dark:bg-green-600';
      return 'bg-green-700 dark:bg-green-500';
    } else {
      // Red for incorrect predictions
      if (intensity < 0.3) return 'bg-red-100 dark:bg-red-900/30';
      if (intensity < 0.6) return 'bg-red-300 dark:bg-red-700/50';
      if (intensity < 0.9) return 'bg-red-500 dark:bg-red-600';
      return 'bg-red-700 dark:bg-red-500';
    }
  };

  const getTextColor = (value: number) => {
    const intensity = value / Math.max(
      ...Object.values(analysis.matrix).flatMap(row => Object.values(row))
    );
    return intensity > 0.5 ? 'text-white' : 'text-gray-900 dark:text-gray-100';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text dark:text-dark-text">
          True vs Predicted Analysis
        </h3>
        <div className="text-sm font-semibold text-green-600 dark:text-green-400">
          {analysis.correct}/{analysis.total} correct ({analysis.accuracy.toFixed(1)}%)
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-4 gap-2">
            {/* Top-left label */}
            <div className="flex items-center justify-center p-2">
              <div className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary text-center">
                True →<br/>Pred ↓
              </div>
            </div>

            {/* Column headers (True labels) */}
            {analysis.classes.map((label) => (
              <div
                key={`true-${label}`}
                className="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-800 rounded"
              >
                <div className="text-xs font-semibold text-center text-text dark:text-dark-text">
                  {label}
                </div>
              </div>
            ))}

            {/* Matrix rows */}
            {analysis.classes.map((predClass) => (
              <div key={`pred-${predClass}`} className="contents">
                {/* Row header (Predicted labels) */}
                <div className="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="text-xs font-semibold text-center text-text dark:text-dark-text">
                    {predClass}
                  </div>
                </div>

                {/* Matrix cells */}
                {analysis.classes.map((trueClass) => {
                  const value = analysis.matrix[trueClass]?.[predClass] || 0;
                  return (
                    <div
                      key={`cell-${predClass}-${trueClass}`}
                      className={`flex flex-col items-center justify-center p-4 rounded transition-all hover:scale-105 ${getCellColor(trueClass, predClass, value)}`}
                    >
                      <div className={`text-2xl font-bold ${getTextColor(value)}`}>
                        {value}
                      </div>
                      <div className={`text-xs ${getTextColor(value)} opacity-75`}>
                        {getPercentage(value)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary dark:text-dark-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Correct predictions (diagonal)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Misclassifications (off-diagonal)</span>
        </div>
      </div>
    </div>
  );
}

