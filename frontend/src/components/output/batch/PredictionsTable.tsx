import { useState, useMemo } from 'react';
import type { RowResult } from '../../../types';

interface PredictionsTableProps {
  rowResults: RowResult[];
}

type SortKey = keyof RowResult;
type SortDirection = 'asc' | 'desc';

export function PredictionsTable({ rowResults }: PredictionsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('koi_period');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [showOnlyMismatches, setShowOnlyMismatches] = useState(false);

  const columns = [
    { key: 'predicted_label' as SortKey, label: 'Predicted', width: 'w-32' },
    { key: 'true_label' as SortKey, label: 'Actual', width: 'w-32' },
    { key: 'koi_period' as SortKey, label: 'Period (d)', width: 'w-24' },
    { key: 'koi_depth' as SortKey, label: 'Depth (ppm)', width: 'w-24' },
    { key: 'koi_duration' as SortKey, label: 'Duration (h)', width: 'w-24' },
    { key: 'koi_prad' as SortKey, label: 'Radius (R⊕)', width: 'w-24' },
    { key: 'koi_steff' as SortKey, label: 'Teff (K)', width: 'w-24' },
    { key: 'koi_model_snr' as SortKey, label: 'SNR', width: 'w-20' },
    { key: 'ra' as SortKey, label: 'RA', width: 'w-20' },
    { key: 'dec' as SortKey, label: 'DEC', width: 'w-20' }
  ];

  const sortedAndFiltered = useMemo(() => {
    let filtered = rowResults;

    if (filterClass !== 'all') {
      filtered = filtered.filter(r => r.predicted_label === filterClass);
    }

    if (showOnlyMismatches) {
      filtered = filtered.filter(r => r.predicted_label !== r.true_label);
    }

    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      const aNum = Number(aVal) || 0;
      const bNum = Number(bVal) || 0;
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    });
  }, [rowResults, sortKey, sortDirection, filterClass, showOnlyMismatches]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getClassColor = (label: string) => {
    switch (label) {
      case 'CONFIRMED': return 'text-green-600 dark:text-green-400 font-semibold';
      case 'CANDIDATE': return 'text-yellow-600 dark:text-yellow-400 font-semibold';
      case 'FALSE POSITIVE': return 'text-red-600 dark:text-red-400 font-semibold';
      default: return '';
    }
  };

  const matches = rowResults.filter(r => r.predicted_label === r.true_label).length;
  const accuracy = ((matches / rowResults.length) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-text dark:text-dark-text">
          Predictions Table
        </h3>
        <div className="text-sm text-text-secondary dark:text-dark-text-secondary">
          {sortedAndFiltered.length} of {rowResults.length} rows • {matches} correct ({accuracy}%)
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-lg text-sm"
        >
          <option value="all">All Classes</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANDIDATE">Candidate</option>
          <option value="FALSE POSITIVE">False Positive</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showOnlyMismatches}
            onChange={(e) => setShowOnlyMismatches(e.target.checked)}
            className="rounded"
          />
          <span className="text-text dark:text-dark-text">Show only mismatches</span>
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border dark:border-dark-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-border dark:border-dark-border">
            <tr>
              <th className="px-4 py-3 text-left w-12">#</th>
              <th className="px-4 py-3 text-center w-16">✓</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left ${col.width} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    {sortKey === col.key && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-dark-border">
            {sortedAndFiltered.map((row, idx) => {
              const isMatch = row.predicted_label === row.true_label;
              return (
                <tr 
                  key={idx}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!isMatch ? 'bg-red-50/20 dark:bg-red-900/10' : ''}`}
                >
                  <td className="px-4 py-2 text-text-secondary dark:text-dark-text-secondary">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {isMatch ? (
                      <span className="text-green-600 dark:text-green-400">✓</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">✗</span>
                    )}
                  </td>
                  <td className={`px-4 py-2 ${getClassColor(row.predicted_label)}`}>
                    {row.predicted_label}
                  </td>
                  <td className={`px-4 py-2 ${getClassColor(row.true_label)}`}>
                    {row.true_label}
                  </td>
                  <td className="px-4 py-2 text-text dark:text-dark-text">
                    {row.koi_period.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-text dark:text-dark-text">
                    {row.koi_depth.toFixed(0)}
                  </td>
                  <td className="px-4 py-2 text-text dark:text-dark-text">
                    {row.koi_duration.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-text dark:text-dark-text">
                    {row.koi_prad.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-text dark:text-dark-text">
                    {row.koi_steff.toFixed(0)}
                  </td>
                  <td className="px-4 py-2 text-text dark:text-dark-text">
                    {row.koi_model_snr.toFixed(1)}
                  </td>
                  <td className="px-4 py-2 text-text dark:text-dark-text">
                    {row.ra.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-text dark:text-dark-text">
                    {row.dec.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

