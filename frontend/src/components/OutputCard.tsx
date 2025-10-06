import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Switch,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import type { AnalysisResult, BatchAnalysisResult, UploadedFile } from '../types';
import { BatchResultsCard } from './output/batch';

interface OutputCardProps {
  result: AnalysisResult | null;
  batchResult: BatchAnalysisResult | null;
  uploadedFile: UploadedFile | null;
  onReset: () => void;
  demoMode?: boolean;
  onDemoModeChange?: (enabled: boolean) => void;
}

export function OutputCard({
  result,
  batchResult,
  uploadedFile: _uploadedFile,
  onReset,
  demoMode = false,
  onDemoModeChange,
}: OutputCardProps) {

  // Helper to download JSON
  const handleDownloadJson = () => {
    const data = batchResult || result;
    if (!data) return;
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exoplanet-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!batchResult) {
    return (
      <Card className="h-full bg-surface dark:bg-dark-surface border border-border dark:border-dark-border">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary-text dark:text-dark-primary-text">Output</h2>
          {onDemoModeChange && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-secondary-text dark:text-dark-secondary-text">Show Demo</span>
              <Switch
                isSelected={demoMode}
                onValueChange={onDemoModeChange}
                size="sm"
                color="success"
              />
            </div>
          )}
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-center h-96 text-secondary-text dark:text-dark-secondary-text">
            No analysis results yet. Upload a file and click Analyze.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card
      isBlurred
      className="border-none bg-surface dark:bg-dark-surface border border-border dark:border-dark-border"
      shadow="sm"
    >
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-primary-text dark:text-dark-primary-text">Output</h2>
          {demoMode && (
            <Chip size="sm" color="success" variant="flat">
              Demo
            </Chip>
          )}
        </div>
        <div className="flex gap-2">
          {onDemoModeChange && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary-text dark:text-dark-secondary-text">Demo Mode</span>
              <Switch
                isSelected={demoMode}
                onValueChange={onDemoModeChange}
                size="sm"
                color="success"
              />
            </div>
          )}
          <Button size="sm" variant="flat" color="danger" onPress={onReset}>
            Reset
          </Button>
          {!demoMode && (
            <Dropdown>
              <DropdownTrigger>
                <Button size="sm" variant="flat">
                  Download
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Download options">
                <DropdownItem key="json" onPress={handleDownloadJson}>
                  JSON
                </DropdownItem>
                <DropdownItem key="csv" isDisabled title="Coming soon">
                  CSV
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </CardHeader>
      <CardBody>
        <BatchResultsCard result={batchResult} />
      </CardBody>
    </Card>
  );
}
