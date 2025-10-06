import { useState } from 'react';
import type { BatchAnalysisResult } from '../../../types';
import { PerformanceMetrics } from './PerformanceMetrics';
import { ConfusionMatrix } from './ConfusionMatrix';
import { PredictionDistribution } from './PredictionDistribution';
import { PredictionsTable } from './PredictionsTable';
import { ScatterPlot } from './ScatterPlot';
import { TrueVsPredicted } from './TrueVsPredicted';
import { FeatureDistributions } from './FeatureDistributions';
import { BoxPlots } from './BoxPlots';
import { SkyMap } from './SkyMap';

interface BatchResultsCardProps {
  result: BatchAnalysisResult;
}

type Tab = 'overview' | 'insights' | 'advanced' | 'table';

export function BatchResultsCard({ result }: BatchResultsCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string; badge?: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'insights', label: 'Insights' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'table', label: 'Data Table' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4 pt-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text dark:text-dark-text">
              Batch Analysis Results
            </h2>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">
              {result.row_results.length} predictions analyzed
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-text-secondary dark:text-dark-text-secondary">
                Model Type
              </div>
              <div className="text-lg font-semibold text-text dark:text-dark-text">
                {result.model_info.model_type}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary dark:text-dark-text-secondary">
                Processing Time
              </div>
              <div className="text-lg font-semibold text-text dark:text-dark-text">
                {(result.model_info.elapsed_s * 1000).toFixed(0)}ms
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border dark:border-dark-border">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors
                border-b-2 relative
                ${
                  activeTab === tab.id
                    ? 'border-primary text-primary dark:text-dark-primary'
                    : 'border-transparent text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text'
                }
              `}
            >
              {tab.label}
              {tab.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary dark:bg-dark-primary/10 dark:text-dark-primary">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <PerformanceMetrics 
              metrics={result.metrics} 
              modelInfo={result.model_info} 
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ConfusionMatrix confusionMatrix={result.metrics.confusion_matrix} />
              <PredictionDistribution predictions={result.decoded_predictions} />
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-8">
            <ScatterPlot rowResults={result.row_results} />
            <TrueVsPredicted rowResults={result.row_results} />
            <FeatureDistributions rowResults={result.row_results} />
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-8">
            <BoxPlots rowResults={result.row_results} />
            <SkyMap rowResults={result.row_results} />
          </div>
        )}

        {activeTab === 'table' && (
          <PredictionsTable rowResults={result.row_results} />
        )}
      </div>
    </div>
  );
}

