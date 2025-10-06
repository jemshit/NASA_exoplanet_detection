import { useRef, useState } from 'react';
import { Card, CardHeader, CardBody, Button, Chip, Select, SelectItem, Switch, Divider, Spinner } from '@heroui/react';
import type { UploadedFile, Parameters } from '../types';
import { useApp } from '../contexts/AppContext';

interface InputCardProps {
  uploadedFile: UploadedFile | null;
  onFileUpload: (file: UploadedFile) => void;
  parameters: Parameters;
  onParametersChange: (parameters: Parameters) => void;
  analyzing: boolean;
  onAnalyze: () => void;
  onCancel: () => void;
  onViewDemo: () => void;
}

export function InputCard({
  uploadedFile,
  onFileUpload,
  parameters,
  onParametersChange,
  analyzing,
  onAnalyze,
  onCancel,
  onViewDemo,
}: InputCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { handleValidateCSV } = useApp();

  const handleFileUpload = async (file: File) => {
    const validExtensions = ['.csv'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(ext)) {
      alert('Please upload a .csv file');
      return;
    }

    // Validate CSV before uploading
    setValidating(true);
    setValidationError(null);

    try {
      const validationResult = await handleValidateCSV(file);
      
      if (validationResult.status === 'error') {
        setValidationError(validationResult.message);
        return;
      }

      // Validation passed
      setValidationError(null);
      onFileUpload({
        name: file.name,
        size: file.size,
        hash: 'sha256:' + Math.random().toString(36).substring(2, 15),
        file: file,
        validation: {
          time: true,
          flux: true,
          flux_err: true,
        },
      });
    } catch (error) {
      console.error('Validation error:', error);
      setValidationError('Failed to validate CSV file');
      alert('Failed to validate CSV file. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const updateParameter = <K extends keyof Parameters>(
    key: K,
    value: Parameters[K]
  ) => {
    onParametersChange({ ...parameters, [key]: value });
  };

  return (
    <Card isBlurred
      className="w-full border-none bg-surface dark:bg-dark-surface border border-border dark:border-dark-border"
      shadow="sm"
    >
      <CardHeader>
        <h2 className="text-xl font-semibold text-primary-text dark:text-dark-primary-text">Configuration</h2>
      </CardHeader>
      <CardBody>
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-primary-text dark:text-dark-primary-text">Upload Kepler CSV</h3>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-accent dark:border-dark-accent bg-accent/10 dark:bg-dark-accent/10'
                  : 'border-border dark:border-dark-border'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="space-y-4">
                {validating ? (
                  <>
                    <Spinner size="lg" color="primary" />
                    <p className="text-secondary-text dark:text-dark-secondary-text">
                      Validating CSV file...
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-secondary-text dark:text-dark-secondary-text">
                      Drag & drop your file here
                    </p>
                    <Button
                      className="bg-accent dark:bg-dark-accent hover:bg-accent-hover dark:hover:bg-dark-accent-hover text-white"
                      onPress={() => fileInputRef.current?.click()}
                      isDisabled={validating}
                    >
                      Browse Files
                    </Button>
                    <p className="text-xs text-disabled dark:text-dark-disabled">Accepts: .csv with Kepler KOI format</p>
                  </>
                )}
              </div>
            </div>

            {validationError && (
              <div className="mt-4 p-3 bg-danger/10 border border-danger rounded-lg">
                <p className="text-sm text-danger">{validationError}</p>
              </div>
            )}

            {uploadedFile && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-primary-text dark:text-dark-primary-text">{uploadedFile.name}</span>
                  <span className="text-secondary-text dark:text-dark-secondary-text">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <Chip
                    color="success"
                    size="sm"
                    variant="flat"
                  >
                    ✓ Validated
                  </Chip>
                </div>
              </div>
            )}
          </div>

          <Divider />

          {/* Parameters Section */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-primary-text dark:text-dark-primary-text">Parameters</h3>
            <Select
              label="Model Type"
              selectedKeys={new Set([parameters.model_type])}
              onChange={(e) =>
                updateParameter('model_type', e.target.value as 'ensemble' | 'binary_categories' | 'multistep')
              }
            >
              <SelectItem key="binary_categories">
                Binary Categories (Light)
              </SelectItem>
              <SelectItem key="multistep">
                Multistep (Medium)
              </SelectItem>
              <SelectItem key="ensemble">
                Ensemble (Heavy)
              </SelectItem>
            </Select>

            <Switch
              isSelected={parameters.class_weight_penalizing}
              onValueChange={(value) => updateParameter('class_weight_penalizing', value)}
            >
              <span className="text-sm text-primary-text dark:text-dark-primary-text">
                Class Weight Penalizing
              </span>
            </Switch>

            <Switch
              isSelected={parameters.drop_fpflags}
              onValueChange={(value) => updateParameter('drop_fpflags', value)}
              className="ml-4"
            >
              <span className="text-sm text-primary-text dark:text-dark-primary-text">
                Drop FP Flags
              </span>
            </Switch>
          </div>

          <Divider />

          {/* Analysis Section */}
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

            <Button
              color="default"
              variant="flat"
              size="lg"
              fullWidth
              onPress={onViewDemo}
            >
              View Demo
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

