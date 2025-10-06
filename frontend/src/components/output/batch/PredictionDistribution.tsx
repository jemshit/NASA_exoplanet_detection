import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';
import type { BatchAnalysisResult } from '../../../types';
import { useTheme } from '../../../contexts/ThemeContext';

interface PredictionDistributionProps {
  predictions: BatchAnalysisResult['decoded_predictions'];
}

export function PredictionDistribution({ predictions }: PredictionDistributionProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!plotRef.current) return;

    // Count predictions by class
    const counts: Record<string, number> = {};
    predictions.forEach((pred) => {
      counts[pred] = (counts[pred] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const values = Object.values(counts);
    const total = predictions.length;

    const colors: Record<string, string> = {
      'CONFIRMED': '#10b981',
      'CANDIDATE': '#f59e0b',
      'FALSE POSITIVE': '#ef4444'
    };

    const data: Partial<Plotly.PlotData>[] = [{
      type: 'pie',
      labels,
      values,
      marker: {
        colors: labels.map(l => colors[l] || '#6b7280')
      },
      textinfo: 'label+percent' as any,
      textposition: 'auto',
      hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percent: %{percent}<extra></extra>',
      hole: 0.4
    }];

    const layout = {
      title: {
        text: `Prediction Distribution (n=${total})`,
        font: { size: 16, color: isDark ? '#e5e7eb' : '#1f2937' }
      },
      showlegend: true,
      legend: {
        orientation: 'h' as const,
        y: -0.1,
        bgcolor: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        font: { color: isDark ? '#e5e7eb' : '#1f2937' }
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        family: 'Inter, sans-serif',
        color: isDark ? '#e5e7eb' : '#1f2937'
      },
      margin: { t: 50, b: 50, l: 20, r: 20 }
    };

    const config = {
      responsive: true,
      displayModeBar: false
    };

    Plotly.newPlot(plotRef.current, data, layout, config);

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [predictions, isDark]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text dark:text-dark-text">
        Prediction Distribution
      </h3>
      <div 
        ref={plotRef} 
        className="w-full h-[400px] bg-white dark:bg-dark-card rounded-lg border border-border dark:border-dark-border"
      />
    </div>
  );
}

