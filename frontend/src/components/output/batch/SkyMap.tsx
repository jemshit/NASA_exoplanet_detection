import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';
import type { RowResult } from '../../../types';
import { useTheme } from '../../../contexts/ThemeContext';

interface SkyMapProps {
  rowResults: RowResult[];
}

const CLASS_COLORS: Record<string, string> = {
  'CONFIRMED': '#10b981',
  'CANDIDATE': '#f59e0b',
  'FALSE POSITIVE': '#ef4444'
};

export function SkyMap({ rowResults }: SkyMapProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!plotRef.current) return;

    const classes = ['CONFIRMED', 'CANDIDATE', 'FALSE POSITIVE'];

    const traces = classes.map(cls => {
      const filtered = rowResults.filter(r => r.predicted_label === cls);
      return {
        x: filtered.map(r => r.ra),
        y: filtered.map(r => r.dec),
        mode: 'markers' as const,
        type: 'scatter' as const,
        name: cls,
        marker: {
          color: CLASS_COLORS[cls],
          size: 10,
          opacity: 0.7,
          symbol: cls === 'CONFIRMED' ? 'circle' : cls === 'CANDIDATE' ? 'diamond' : 'x',
          line: {
            color: 'white',
            width: 1
          }
        },
        text: filtered.map(r => 
          `<b>${cls}</b><br>` +
          `RA: ${r.ra.toFixed(2)}°<br>` +
          `DEC: ${r.dec.toFixed(2)}°<br>` +
          `Period: ${r.koi_period.toFixed(2)} days<br>` +
          `Radius: ${r.koi_prad.toFixed(2)} R⊕`
        ),
        hovertemplate: '%{text}<extra></extra>'
      };
    });

    const layout: Partial<Plotly.Layout> = {
      title: {
        text: 'Sky Position Map (RA vs DEC)',
        font: { size: 16, color: isDark ? '#e5e7eb' : '#1f2937' }
      },
      xaxis: {
        title: { text: 'Right Ascension (degrees)', font: { color: isDark ? '#d1d5db' : '#374151' } },
        showgrid: true,
        gridcolor: isDark ? '#374151' : '#e5e7eb',
        zeroline: false,
        range: [280, 305],
        color: isDark ? '#9ca3af' : '#6b7280'
      },
      yaxis: {
        title: { text: 'Declination (degrees)', font: { color: isDark ? '#d1d5db' : '#374151' } },
        showgrid: true,
        gridcolor: isDark ? '#374151' : '#e5e7eb',
        zeroline: false,
        range: [35, 55],
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
      <div>
        <h3 className="text-lg font-semibold text-text dark:text-dark-text">
          Celestial Sky Map
        </h3>
        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">
          Distribution of exoplanet candidates across the observed sky region
        </p>
      </div>
      <div 
        ref={plotRef} 
        className="w-full h-[500px] bg-white dark:bg-dark-card rounded-lg border border-border dark:border-dark-border overflow-hidden"
      />
      <div className="text-xs text-text-secondary dark:text-dark-text-secondary space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
          <span>Confirmed Exoplanets</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rotate-45 bg-yellow-500"></span>
          <span>Candidates (require follow-up)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block text-red-500">✕</span>
          <span>False Positives</span>
        </div>
      </div>
    </div>
  );
}

