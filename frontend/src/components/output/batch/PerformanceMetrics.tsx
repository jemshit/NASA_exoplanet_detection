import type { BatchAnalysisResult } from '../../../types';

interface PerformanceMetricsProps {
  metrics: BatchAnalysisResult['metrics'];
  modelInfo: BatchAnalysisResult['model_info'];
}

export function PerformanceMetrics({ metrics, modelInfo }: PerformanceMetricsProps) {
  const metricCards = [
    {
      label: 'Accuracy',
      value: (metrics.accuracy * 100).toFixed(1) + '%',
      icon: '🎯',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Precision',
      value: (metrics.precision * 100).toFixed(1) + '%',
      icon: '✓',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Recall',
      value: (metrics.recall * 100).toFixed(1) + '%',
      icon: '📊',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: 'F1 Score',
      value: (metrics.f1 * 100).toFixed(1) + '%',
      icon: '⚖️',
      color: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text dark:text-dark-text">
          Model Performance
        </h3>
        <div className="text-sm text-text-secondary dark:text-dark-text-secondary">
          <span className="font-medium">{modelInfo.model_type}</span>
          <span className="mx-2">•</span>
          <span>{(modelInfo.elapsed_s * 1000).toFixed(0)}ms</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric) => (
          <div
            key={metric.label}
            className="bg-white dark:bg-dark-card rounded-lg p-4 border border-border dark:border-dark-border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{metric.icon}</span>
              <span className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </span>
            </div>
            <div className="text-sm text-text-secondary dark:text-dark-text-secondary">
              {metric.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

