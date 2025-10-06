import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';
import type { RowResult } from '../../../types';
import { useTheme } from '../../../contexts/ThemeContext';

interface FeatureDistributionsProps {
  rowResults: RowResult[];
}

const CLASS_COLORS: Record<string, string> = {
  'CONFIRMED': '#10b981',
  'CANDIDATE': '#f59e0b',
  'FALSE POSITIVE': '#ef4444'
};

export function FeatureDistributions({ rowResults }: FeatureDistributionsProps) {
  const periodRef = useRef<HTMLDivElement>(null);
  const depthRef = useRef<HTMLDivElement>(null);
  const radiusRef = useRef<HTMLDivElement>(null);
  const snrRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const features = [
      { ref: periodRef, key: 'koi_period' as const, title: 'Orbital Period (days)', log: true },
      { ref: depthRef, key: 'koi_depth' as const, title: 'Transit Depth (ppm)', log: false },
      { ref: radiusRef, key: 'koi_prad' as const, title: 'Planet Radius (Earth Radii)', log: false },
      { ref: snrRef, key: 'koi_model_snr' as const, title: 'Signal-to-Noise Ratio', log: false }
    ];

    const classes = ['CONFIRMED', 'CANDIDATE', 'FALSE POSITIVE'];

    features.forEach(({ ref, key, title, log }) => {
      if (!ref.current) return;

      const traces = classes.map(cls => {
        const values = rowResults
          .filter(r => r.predicted_label === cls)
          .map(r => r[key] as number);

        return {
          x: values,
          type: 'histogram' as const,
          name: cls,
          opacity: 0.7,
          marker: {
            color: CLASS_COLORS[cls]
          },
          hovertemplate: '<b>%{fullData.name}</b><br>Value: %{x}<br>Count: %{y}<extra></extra>'
        };
      });

      const layout: Partial<Plotly.Layout> = {
        title: {
          text: title,
          font: { size: 14, color: isDark ? '#e5e7eb' : '#1f2937' }
        },
        xaxis: {
          title: { text: '', font: { color: isDark ? '#d1d5db' : '#374151' } },
          type: log ? 'log' : 'linear',
          gridcolor: isDark ? '#374151' : '#e5e7eb',
          color: isDark ? '#9ca3af' : '#6b7280'
        },
        yaxis: {
          title: { text: 'Count', font: { color: isDark ? '#d1d5db' : '#374151' } },
          gridcolor: isDark ? '#374151' : '#e5e7eb',
          color: isDark ? '#9ca3af' : '#6b7280'
        },
        barmode: 'overlay' as const,
        showlegend: true,
        legend: {
          x: 1.02,
          y: 1,
          xanchor: 'left' as const,
          bgcolor: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          font: { color: isDark ? '#e5e7eb' : '#1f2937' }
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: isDark ? '#0f172a' : '#f9fafb',
        font: {
          family: 'Inter, sans-serif',
          size: 11,
          color: isDark ? '#e5e7eb' : '#1f2937'
        },
        margin: { t: 40, b: 40, l: 50, r: 100 }
      };

      const config = {
        responsive: true,
        displayModeBar: false
      };

      Plotly.newPlot(ref.current, traces, layout, config);
    });

    return () => {
      features.forEach(({ ref }) => {
        if (ref.current) {
          Plotly.purge(ref.current);
        }
      });
    };
  }, [rowResults, isDark]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text dark:text-dark-text">
        Feature Distributions by Class
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div 
          ref={periodRef} 
          className="w-full h-[300px] bg-white dark:bg-dark-card rounded-lg border border-border dark:border-dark-border p-2"
        />
        <div 
          ref={depthRef} 
          className="w-full h-[300px] bg-white dark:bg-dark-card rounded-lg border border-border dark:border-dark-border p-2"
        />
        <div 
          ref={radiusRef} 
          className="w-full h-[300px] bg-white dark:bg-dark-card rounded-lg border border-border dark:border-dark-border p-2"
        />
        <div 
          ref={snrRef} 
          className="w-full h-[300px] bg-white dark:bg-dark-card rounded-lg border border-border dark:border-dark-border p-2"
        />
      </div>
    </div>
  );
}

