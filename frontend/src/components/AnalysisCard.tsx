import { Card, CardHeader, CardBody, Button } from '@heroui/react';

interface AnalysisCardProps {
  uploadedFile: boolean;
  analyzing: boolean;
  onAnalyze: () => void;
  onCancel: () => void;
}

export function AnalysisCard({
  uploadedFile,
  analyzing,
  onAnalyze,
  onCancel,
}: AnalysisCardProps) {
  return (
    <Card isBlurred
      className="border-none bg-surface dark:bg-dark-surface max-w-[610px] border border-border dark:border-dark-border"
      shadow="sm"
    >
      <CardHeader>
        <h2 className="text-xl font-semibold text-primary-text dark:text-dark-primary-text">Analysis</h2>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <Button
            className="bg-accent dark:bg-dark-accent hover:bg-accent-hover dark:hover:bg-dark-accent-hover text-white"
            size="lg"
            fullWidth
            onPress={onAnalyze}
            isDisabled={!uploadedFile || analyzing}
          >
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </Button>

          {analyzing && (
            <Button
              color="danger"
              variant="light"
              size="lg"
              fullWidth
              onPress={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

