import { AppBar } from './components/AppBar';
import { InputCard } from './components/InputCard';
import { OutputCard } from './components/OutputCard';
import { useApp } from './contexts/AppContext';
import { Card, CardBody, Button } from '@heroui/react';

function App() {
  const {
    uploadedFile,
    parameters,
    analyzing,
    result,
    batchResult,
    demoMode,
    error,
    setError,
    setParameters,
    handleFileUpload,
    handleAnalyze,
    handleCancel,
    handleReset,
    handleDemoModeChange,
    handleViewDemo,
  } = useApp();

  const hasResults = result || batchResult;

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <AppBar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <Card 
            className="mb-6 border-2 border-danger bg-danger/10 dark:bg-danger/20"
            shadow="sm"
          >
            <CardBody>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-danger mb-2">Error</h3>
                  <p className="text-sm text-danger whitespace-pre-wrap">{error}</p>
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => setError(null)}
                  aria-label="Close error"
                >
                  ✕
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        <div className="flex flex-col lg:flex-row justify-center gap-6">
          {/* Left Column - Hide when in demo mode */}
          {!demoMode && (
            <div className={`w-full ${hasResults ? 'lg:w-3/12' : 'lg:w-6/12'}`}>
              <InputCard
                uploadedFile={uploadedFile}
                onFileUpload={handleFileUpload}
                parameters={parameters}
                onParametersChange={setParameters}
                analyzing={analyzing}
                onAnalyze={handleAnalyze}
                onCancel={handleCancel}
                onViewDemo={handleViewDemo}
              />
            </div>
          )}

          {/* Right Column - Only show after analysis is complete */}
          {hasResults && (
            <div className={`w-full ${demoMode ? 'lg:w-full' : 'lg:w-9/12'}`}>
              <OutputCard
                result={result}
                batchResult={batchResult}
                uploadedFile={uploadedFile}
                onReset={handleReset}
                demoMode={demoMode}
                onDemoModeChange={handleDemoModeChange}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
