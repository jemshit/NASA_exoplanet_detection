import type { AnalysisResult } from '../../types';
import { SaliencySparkline } from '../PlotlyCharts';

interface ExplainabilityTabProps {
  explain?: AnalysisResult['explain'];
}

export function ExplainabilityTab({ explain }: ExplainabilityTabProps) {
  if (explain?.top_features) {
    return (
      <div className="pt-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary-text dark:text-dark-primary-text">
            Top Features (SHAP)
          </h3>
          <div className="space-y-3">
            {explain.top_features.slice(0, 5).map((feature, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-primary-text dark:text-dark-primary-text font-medium">
                    {feature.name}
                  </span>
                  <span className="text-secondary-text dark:text-dark-secondary-text">
                    value: {feature.value} | SHAP: {feature.shap.toFixed(3)}
                  </span>
                </div>
                <div className="w-full bg-border dark:bg-dark-border rounded-full h-6">
                  <div
                    className={`h-6 rounded-full flex items-center justify-end pr-2 ${
                      feature.shap > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.abs(feature.shap) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">
                      {(feature.shap * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (explain?.saliency) {
    return (
      <div className="pt-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary-text dark:text-dark-primary-text">
            Saliency Map
          </h3>
          <div className="bg-background dark:bg-dark-background rounded-lg p-6 border border-border dark:border-dark-border">
            <SaliencySparkline saliency={explain.saliency} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="h-64 flex items-center justify-center text-secondary-text dark:text-dark-secondary-text">
        No explainability data
      </div>
    </div>
  );
}

