import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Tabs,
  Tab,
  Chip,
  Switch,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import type { AnalysisResult, UploadedFile } from '../types';
import { SummaryTab } from './output/SummaryTab';
import { PhaseFoldTab } from './output/PhaseFoldTab';
import { ExplainabilityTab } from './output/ExplainabilityTab';
import { JSONTab } from './output/JSONTab';

interface OutputCardProps {
  result: AnalysisResult | null;
  uploadedFile: UploadedFile | null;
  onReset: () => void;
  demoMode?: boolean;
  onDemoModeChange?: (enabled: boolean) => void;
  onDemoExampleChange?: (example: 'lgbm' | 'cnn') => void;
}

export function OutputCard({
  result,
  uploadedFile: _uploadedFile,
  onReset,
  demoMode = false,
  onDemoModeChange,
  onDemoExampleChange,
}: OutputCardProps) {
  const [currentExample, setCurrentExample] = useState<'lgbm' | 'cnn'>('lgbm');

  // Helper to download JSON
  const handleDownloadJson = () => {
    if (!result) return;
    const dataStr = JSON.stringify(result, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exoplanet-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!result) {
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
          {demoMode && onDemoExampleChange && (
            <Dropdown>
              <DropdownTrigger>
                <Button size="sm" variant="flat" color="success">
                  {currentExample}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Demo examples"
                selectionMode="single"
                selectedKeys={[currentExample]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as 'lgbm' | 'cnn';
                  setCurrentExample(selected);
                  onDemoExampleChange(selected);
                }}
              >
                <DropdownItem key="lgbm">LightGBM (CONFIRMED)</DropdownItem>
                <DropdownItem key="cnn">CNN (FALSE_POSITIVE)</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
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
              <DropdownItem key="pdf" isDisabled title="Coming soon">
                PDF
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
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
        </div>
      </CardHeader>
      <CardBody>
        <Tabs aria-label="Output tabs" className="w-full">
          <Tab key="summary" title="Summary">
            <SummaryTab result={result} />
          </Tab>
          <Tab key="phasefold" title="Phase-Fold">
            <PhaseFoldTab plots={result.plots} />
          </Tab>
          <Tab key="explain" title="Explainability">
            <ExplainabilityTab explain={result.explain} />
          </Tab>
          <Tab key="json" title="JSON">
            <JSONTab result={result} />
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );
}
