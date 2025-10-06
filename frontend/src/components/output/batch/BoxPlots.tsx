import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';
import type { RowResult } from '../../../types';
import { useTheme } from '../../../contexts/ThemeContext';

interface BoxPlotsProps {
  rowResults: RowResult[];
}

const CLASS_COLORS: Record<string, string> = {
  'CONFIRMED': '#10b981',
  'CANDIDATE': '#f59e0b',
  'FALSE POSITIVE': '#ef4444'
};

export function BoxPlots({ rowResults }: BoxPlotsProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!plotRef.current) return;

    const features = [
      { key: 'koi_period' as const, name: 'Period (days)' },
      { key: 'koi_depth' as const, name: 'Depth (ppm)' },
      { key: 'koi_model_snr' as const, name: 'SNR' },
      { key: 'koi_prad' as const, name: 'Radius (R⊕)' }
    ];

    const classes = ['CONFIRMED', 'CANDIDATE', 'FALSE POSITIVE'];

    // Create traces for each feature and class
    const traces: any[] = [];

    features.forEach((feature, featureIdx) => {
      classes.forEach(cls => {
        const values = rowResults
          .filter(r => r.predicted_label === cls)
          .map(r => r[feature.key] as number);

        traces.push({
          y: values,
          type: 'box',
          name: cls,
          legendgroup: cls,
          showlegend: featureIdx === 0, // Only show legend for first feature
          marker: {
            color: CLASS_COLORS[cls]
          },
          boxmean: 'sd' as const,
          xaxis: `x${featureIdx + 1}`,
          hovertemplate: '<b>%{fullData.name}</b><br>%{y:.2f}<extra></extra>'
        });
      });
    });

    const layout: any = {
      title: {
        text: 'Feature Distributions by Class (Box Plots)',
        font: { size: 16, color: isDark ? '#e5e7eb' : '#1f2937' }
      },
      showlegend: true,
      legend: {
        orientation: 'h' as const,
        y: 1.1,
        bgcolor: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        font: { color: isDark ? '#e5e7eb' : '#1f2937' }
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: isDark ? '#0f172a' : '#f9fafb',
      font: {
        family: 'Inter, sans-serif',
        color: isDark ? '#e5e7eb' : '#1f2937'
      },
      margin: { t: 80, b: 60, l: 60, r: 40 },
      grid: {
        rows: 1,
        columns: 4,
        pattern: 'independent' as const
      }
    };

    // Configure axes for each feature
    features.forEach((feature, idx) => {
      const axisNum = idx + 1;
      layout[`xaxis${axisNum === 1 ? '' : axisNum}`] = {
        title: feature.name,
        showticklabels: false,
        gridcolor: isDark ? '#374151' : '#e5e7eb',
        color: isDark ? '#9ca3af' : '#6b7280'
      };
      layout[`yaxis${axisNum === 1 ? '' : axisNum}`] = {
        type: feature.key === 'koi_period' ? 'log' : 'linear',
        gridcolor: isDark ? '#374151' : '#e5e7eb',
        color: isDark ? '#9ca3af' : '#6b7280'
      };
    });

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'] as any
    };

    Plotly.newPlot(plotRef.current, traces, layout, config);

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [rowResults, isDark]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text dark:text-dark-text">
        Box Plots by Class
      </h3>
      <div 
        ref={plotRef} 
        className="w-full h-[500px] bg-white dark:bg-dark-card rounded-lg border border-border dark:border-dark-border"
      />
    </div>
  );
}

