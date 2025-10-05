import { useState } from 'react';
import { Button } from '@heroui/react';
import type { AnalysisResult } from '../../types';

interface JSONTabProps {
  result: AnalysisResult;
}

export function JSONTab({ result }: JSONTabProps) {
  const [expandedJson, setExpandedJson] = useState(true);

  return (
    <div className="pt-4 space-y-3">
      <div className="flex justify-between items-center">
        <Button size="sm" variant="light" onPress={() => setExpandedJson(!expandedJson)}>
          {expandedJson ? 'Collapse' : 'Expand'}
        </Button>
      </div>
      {expandedJson && (
        <pre className="bg-background dark:bg-dark-background rounded-lg p-4 text-xs overflow-auto max-h-96 border border-border dark:border-dark-border text-primary-text dark:text-dark-primary-text">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

