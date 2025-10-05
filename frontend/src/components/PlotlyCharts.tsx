import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';
import { useTheme } from '../contexts/ThemeContext';

interface PhaseFoldChartProps {
  phaseFolded: { x: number[]; y: number[] };
  residuals?: { x: number[]; y: number[] };
}

export function PhaseFoldChart({ phaseFolded, residuals }: PhaseFoldChartProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!plotRef.current) return;

    const traces: Plotly.Data[] = [
      {
        x: phaseFolded.x,
        y: phaseFolded.y,
        mode: 'lines+markers',
        name: 'Phase-Folded',
        line: { color: isDark ? '#a78bfa' : '#7c3aed', width: 2 },
        marker: { size: 6, color: isDark ? '#a78bfa' : '#7c3aed' },
        type: 'scatter',
      },
    ];

    if (residuals) {
      traces.push({
        x: residuals.x,
        y: residuals.y,
        mode: 'lines',
        name: 'Residuals',
        line: { color: '#eab308', width: 2, dash: 'dash' },
        yaxis: 'y2',
        type: 'scatter',
      });
    }

    const layout: Partial<Plotly.Layout> = {
      xaxis: {
        title: { text: 'Phase', font: { color: isDark ? '#d1d5db' : '#374151' } },
        gridcolor: isDark ? '#374151' : '#e5e7eb',
        zerolinecolor: isDark ? '#4b5563' : '#d1d5db',
        color: isDark ? '#d1d5db' : '#374151',
      },
      yaxis: {
        title: { text: 'Normalized Flux', font: { color: isDark ? '#d1d5db' : '#374151' } },
        gridcolor: isDark ? '#374151' : '#e5e7eb',
        zerolinecolor: isDark ? '#4b5563' : '#d1d5db',
        color: isDark ? '#d1d5db' : '#374151',
      },
      ...(residuals && {
        yaxis2: {
          title: { text: 'Residuals', font: { color: isDark ? '#d1d5db' : '#374151' } },
          overlaying: 'y',
          side: 'right',
          gridcolor: isDark ? '#374151' : '#f3f4f6',
          color: isDark ? '#d1d5db' : '#374151',
        },
      }),
      margin: { l: 50, r: residuals ? 50 : 20, t: 20, b: 50 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { family: 'system-ui, sans-serif', size: 12, color: isDark ? '#d1d5db' : '#374151' },
      showlegend: true,
      legend: { x: 0.02, y: 0.98, bgcolor: isDark ? 'rgba(31,41,55,0.9)' : 'rgba(255,255,255,0.9)', font: { color: isDark ? '#d1d5db' : '#374151' } },
      hovermode: 'closest',
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    };

    Plotly.newPlot(plotRef.current, traces, layout, config);

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [phaseFolded, residuals, isDark]);

  return <div ref={plotRef} className="w-full h-[400px]" />;
}

interface TimeSeriesChartProps {
  timeseries: { x: number[]; y: number[] };
}

export function TimeSeriesChart({ timeseries }: TimeSeriesChartProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!plotRef.current) return;

    const trace: Plotly.Data = {
      x: timeseries.x,
      y: timeseries.y,
      mode: 'lines',
      name: 'Time Series',
      line: { color: isDark ? '#a78bfa' : '#7c3aed', width: 1.5 },
      type: 'scatter',
    };

    const layout: Partial<Plotly.Layout> = {
      xaxis: {
        title: { text: 'Time (days)', font: { color: isDark ? '#d1d5db' : '#374151' } },
        gridcolor: isDark ? '#374151' : '#e5e7eb',
        zerolinecolor: isDark ? '#4b5563' : '#d1d5db',
        color: isDark ? '#d1d5db' : '#374151',
      },
      yaxis: {
        title: { text: 'Flux', font: { color: isDark ? '#d1d5db' : '#374151' } },
        gridcolor: isDark ? '#374151' : '#e5e7eb',
        zerolinecolor: isDark ? '#4b5563' : '#d1d5db',
        color: isDark ? '#d1d5db' : '#374151',
      },
      margin: { l: 50, r: 20, t: 20, b: 50 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { family: 'system-ui, sans-serif', size: 12, color: isDark ? '#d1d5db' : '#374151' },
      showlegend: false,
      hovermode: 'closest',
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    };

    Plotly.newPlot(plotRef.current, [trace], layout, config);

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [timeseries, isDark]);

  return <div ref={plotRef} className="w-full h-[400px]" />;
}

interface SaliencySparklineProps {
  saliency: number[];
}

export function SaliencySparkline({ saliency }: SaliencySparklineProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!plotRef.current) return;

    const xValues = saliency.map((_, i) => i / (saliency.length - 1));

    const trace: Plotly.Data = {
      x: xValues,
      y: saliency,
      mode: 'lines',
      fill: 'tozeroy',
      name: 'Saliency',
      line: { color: isDark ? '#a78bfa' : '#7c3aed', width: 2 },
      fillcolor: isDark ? 'rgba(167, 139, 250, 0.2)' : 'rgba(124, 58, 237, 0.2)',
      type: 'scatter',
    };

    const layout: Partial<Plotly.Layout> = {
      xaxis: {
        title: { text: 'Normalized Phase', font: { color: isDark ? '#d1d5db' : '#374151' } },
        gridcolor: isDark ? '#374151' : '#e5e7eb',
        zerolinecolor: isDark ? '#4b5563' : '#d1d5db',
        color: isDark ? '#d1d5db' : '#374151',
      },
      yaxis: {
        title: { text: 'Saliency', font: { color: isDark ? '#d1d5db' : '#374151' } },
        gridcolor: isDark ? '#374151' : '#e5e7eb',
        zerolinecolor: isDark ? '#4b5563' : '#d1d5db',
        color: isDark ? '#d1d5db' : '#374151',
      },
      margin: { l: 50, r: 20, t: 20, b: 50 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { family: 'system-ui, sans-serif', size: 12, color: isDark ? '#d1d5db' : '#374151' },
      showlegend: false,
      hovermode: 'closest',
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    };

    Plotly.newPlot(plotRef.current, [trace], layout, config);

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [saliency, isDark]);

  return <div ref={plotRef} className="w-full h-[300px]" />;
}

