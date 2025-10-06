import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';
import type { RowResult } from '../../../types';
import { useTheme } from '../../../contexts/ThemeContext';

interface ScatterPlotProps {
  rowResults: RowResult[];
}

const CLASS_COLORS: Record<string, string> = {
  'CONFIRMED': '#10b981',
  'CANDIDATE': '#f59e0b',
  'FALSE POSITIVE': '#ef4444'
};

export function ScatterPlot({ rowResults }: ScatterPlotProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!plotRef.current) return;

    // Group data by predicted class
    const classes = ['CONFIRMED', 'CANDIDATE', 'FALSE POSITIVE'];
    const traces = classes.map(cls => {
      const filtered = rowResults.filter(r => r.predicted_label === cls);
      return {
        x: filtered.map(r => r.koi_period),
        y: filtered.map(r => r.koi_prad),
        mode: 'markers' as const,
        type: 'scatter' as const,
        name: cls,
        marker: {
          color: CLASS_COLORS[cls],
          size: 8,
          opacity: 0.7,
          line: {
            color: 'white',
            width: 1
          }
        },
        text: filtered.map(r => 
          `Period: ${r.koi_period.toFixed(2)} days<br>` +
          `Radius: ${r.koi_prad.toFixed(2)} R⊕<br>` +
          `Depth: ${r.koi_depth.toFixed(0)} ppm<br>` +
          `SNR: ${r.koi_model_snr.toFixed(1)}`
        ),
        hovertemplate: '<b>%{fullData.name}</b><br>%{text}<extra></extra>'
      };
    });

    const layout: Partial<Plotly.Layout> = {
      title: {
        text: 'Period vs Radius by Classification',
        font: { size: 16, color: isDark ? '#e5e7eb' : '#1f2937' }
      },
      xaxis: {
        title: { text: 'Orbital Period (days)', font: { color: isDark ? '#d1d5db' : '#374151' } },
        type: 'log',
        showgrid: true,
        gridcolor: isDark ? '#374151' : '#e5e7eb',
        zeroline: false,
        color: isDark ? '#9ca3af' : '#6b7280'
      },
      yaxis: {
        title: { text: 'Planet Radius (Earth Radii)', font: { color: isDark ? '#d1d5db' : '#374151' } },
        type: 'log',
        showgrid: true,
        gridcolor: isDark ? '#374151' : '#e5e7eb',
        zeroline: false,
        color: isDark ? '#9ca3af' : '#6b7280'
      },
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
        color: isDark ? '#e5e7eb' : '#1f2937'
      },
      margin: { t: 50, b: 60, l: 70, r: 120 },
      hovermode: 'closest' as const
    };

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
        Period vs Radius Scatter Plot
      </h3>
      <div 
        ref={plotRef} 
        className="w-full h-[500px] bg-white dark:bg-dark-card rounded-lg border border-border dark:border-dark-border"
      />
    </div>
  );
}

