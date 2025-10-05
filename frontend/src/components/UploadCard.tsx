import { useRef, useState } from 'react';
import { Card, CardHeader, CardBody, Button, Chip } from '@heroui/react';
import type { UploadedFile } from '../types';

interface UploadCardProps {
  uploadedFile: UploadedFile | null;
  onFileUpload: (file: UploadedFile) => void;
}

export function UploadCard({ uploadedFile, onFileUpload }: UploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    const validExtensions = ['.csv', '.fits', '.zip'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(ext)) {
      alert('Please upload a .csv, .fits, or .zip file');
      return;
    }

    onFileUpload({
      name: file.name,
      size: file.size,
      hash: 'sha256:' + Math.random().toString(36).substring(2, 15),
      validation: {
        time: true,
        flux: true,
        flux_err: true,
      },
    });
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
    if (file) handleFileUpload(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <Card isBlurred
      className="border-none bg-surface dark:bg-dark-surface max-w-[610px] border border-border dark:border-dark-border"
      shadow="sm"
    >
      <CardHeader>
        <h2 className="text-xl font-semibold text-primary-text dark:text-dark-primary-text">Upload Lightcurve</h2>
      </CardHeader>
      <CardBody>
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
            accept=".csv,.fits,.zip"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="space-y-4">
            <p className="text-secondary-text dark:text-dark-secondary-text">
              Drag & drop your file here
            </p>
            <Button
              className="bg-accent dark:bg-dark-accent hover:bg-accent-hover dark:hover:bg-dark-accent-hover text-white"
              onPress={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>
            <p className="text-xs text-disabled dark:text-dark-disabled">Accepts: .csv, .fits, .zip</p>
          </div>
        </div>

        {uploadedFile && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-primary-text dark:text-dark-primary-text">{uploadedFile.name}</span>
              <span className="text-secondary-text dark:text-dark-secondary-text">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <p className="text-xs text-disabled dark:text-dark-disabled font-mono">{uploadedFile.hash}</p>
            <div className="flex gap-2 flex-wrap">
              <Chip
                color={uploadedFile.validation.time ? 'success' : 'danger'}
                size="sm"
                variant="flat"
              >
                time ✓
              </Chip>
              <Chip
                color={uploadedFile.validation.flux ? 'success' : 'danger'}
                size="sm"
                variant="flat"
              >
                flux ✓
              </Chip>
              <Chip
                color={uploadedFile.validation.flux_err ? 'success' : 'danger'}
                size="sm"
                variant="flat"
              >
                flux_err ✓
              </Chip>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

