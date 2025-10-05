import { useState } from 'react';
import { AppBar } from './components/AppBar';
import { UploadCard } from './components/UploadCard';
import { ParametersCard } from './components/ParametersCard';
import { AnalysisCard } from './components/AnalysisCard';
import { OutputCard } from './components/OutputCard';
import type { UploadedFile, Parameters, AnalysisResult } from './types';
import { defaultParameters } from './types';
import { mockLightGBM, mockCNN } from './data/mockData';

function App() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [parameters, setParameters] = useState<Parameters>(defaultParameters);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFile(file);
    setResult(null);
    setDemoMode(false);
  };

  const handleDemoModeChange = (enabled: boolean) => {
    setDemoMode(enabled);
    if (enabled) {
      setResult(mockLightGBM);
    } else {
      setResult(null);
    }
  };

  const handleDemoExampleChange = (example: 'lgbm' | 'cnn') => {
    if (example === 'lgbm') {
      setResult(mockLightGBM);
    } else {
      setResult(mockCNN);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      alert('Please upload a file first');
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setDemoMode(false);

    const steps = [
      { msg: 'Loading lightcurve data...', duration: 500 },
      { msg: 'Detrending using ' + parameters.detrend + '...', duration: 800 },
      { msg: 'Running TLS (Transit Least Squares)...', duration: 1200 },
      { msg: 'Fitting transit model...', duration: 700 },
      { msg: 'Classifying with ' + parameters.model.toUpperCase() + '...', duration: 600 },
      { msg: 'Analysis complete!', duration: 300 },
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, steps[i].duration));
    }

    // Alternate between two examples
    const mockResults = [mockLightGBM, mockCNN];
    setResult(mockResults[Math.floor(Math.random() * mockResults.length)]);

    setAnalyzing(false);
  };

  const handleCancel = () => {
    setAnalyzing(false);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setResult(null);
    setDemoMode(false);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <AppBar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="w-full lg:w-3/12 space-y-6">
            <UploadCard
              uploadedFile={uploadedFile}
              onFileUpload={handleFileUpload}
            />
            <ParametersCard
              parameters={parameters}
              onParametersChange={setParameters}
            />
            <AnalysisCard
              uploadedFile={!!uploadedFile}
              analyzing={analyzing}
              onAnalyze={handleAnalyze}
              onCancel={handleCancel}
            />
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-8/12">
            <OutputCard
              result={result}
              parameters={parameters}
              uploadedFile={uploadedFile}
              onReset={handleReset}
              demoMode={demoMode}
              onDemoModeChange={handleDemoModeChange}
              onDemoExampleChange={handleDemoExampleChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
