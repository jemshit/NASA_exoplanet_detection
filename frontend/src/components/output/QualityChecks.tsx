import { Chip } from '@heroui/react';
import type { AnalysisResult } from '../../types';

interface QualityChecksProps {
  metrics: AnalysisResult['metrics'];
  qc?: AnalysisResult['qc'];
}

export function QualityChecks({ metrics, qc }: QualityChecksProps) {
  if (!qc) return null;

  const oddEvenPass = metrics.oddEvenDelta !== undefined && metrics.oddEvenDelta < 0.05;
  const secondaryPass = metrics.secondaryDepthPpm !== undefined && metrics.secondaryDepthPpm < 50;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-primary-text dark:text-dark-primary-text">
        Quality Checks
      </h3>
      <div className="flex flex-wrap gap-2">
        {metrics.oddEvenDelta !== undefined && (
          <Chip
            size="sm"
            color={oddEvenPass ? 'success' : 'warning'}
            variant="flat"
            startContent={oddEvenPass ? '✅' : '⚠️'}
          >
            Odd/Even {oddEvenPass ? 'Pass' : 'Check'}
          </Chip>
        )}
        {metrics.secondaryDepthPpm !== undefined && (
          <Chip
            size="sm"
            color={secondaryPass ? 'success' : 'warning'}
            variant="flat"
            startContent={secondaryPass ? '✅' : '⚠️'}
          >
            Secondary {secondaryPass ? 'Pass' : 'Check'}
          </Chip>
        )}
        {qc.notes?.some((note) => note.toLowerCase().includes('pdcsap')) && (
          <Chip size="sm" color="default" variant="flat">
            PDCSAP detrend
          </Chip>
        )}
      </div>
      {qc.warnings && qc.warnings.length > 0 && (
        <div className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
          {qc.warnings.map((warning, i) => (
            <p key={i}>⚠️ {warning}</p>
          ))}
        </div>
      )}
      {qc.notes && qc.notes.length > 0 && (
        <div className="text-xs text-secondary-text dark:text-dark-secondary-text space-y-1">
          {qc.notes.map((note, i) => (
            <p key={i}>{note}</p>
          ))}
        </div>
      )}
    </div>
  );
}

