import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { UploadedFile, Parameters, AnalysisResult } from '../types';
import { defaultParameters } from '../types';

// API Configuration
const API_BASE_URL = 'http://localhost:5005';

interface AppContextType {
  uploadedFile: UploadedFile | null;
  parameters: Parameters;
  analyzing: boolean;
  result: AnalysisResult | null;
  demoMode: boolean;
  userSessionId: string;
  error: string | null;
  setUploadedFile: (file: UploadedFile | null) => void;
  setParameters: (params: Parameters) => void;
  setDemoMode: (enabled: boolean) => void;
  setError: (error: string | null) => void;
  handleFileUpload: (file: UploadedFile) => void;
  handleValidateCSV: (file: File) => Promise<any>;
  handleAnalyze: () => Promise<void>;
  handleCancel: () => void;
  handleReset: () => void;
  handleDemoModeChange: (enabled: boolean) => void;
  handleDemoExampleChange: (example: 'lgbm' | 'cnn') => void;
  handleViewDemo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Generate or retrieve user session ID using uuid
const getUserSessionId = (): string => {
  let sessionId = localStorage.getItem('user-session-id');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('user-session-id', sessionId);
  }
  return sessionId;
};

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [parameters, setParameters] = useState<Parameters>(defaultParameters);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [userSessionId, setUserSessionId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize user session ID on mount
    setUserSessionId(getUserSessionId());
  }, []);

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFile(file);
    setResult(null);
    setDemoMode(false);
    setError(null);
  };

  const handleValidateCSV = async (file: File): Promise<any> => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/validate-csv`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.status === 'error') {
        setError(`CSV Validation Failed: ${result.message}`);
      }
      
      return result;
    } catch (error) {
      console.error('CSV validation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      setError(`CSV Validation Error: ${errorMessage}`);
      return {
        status: 'error',
        message: errorMessage
      };
    }
  };

  const handleDemoModeChange = (enabled: boolean) => {
    setDemoMode(enabled);
    if (enabled) {
      // Import mock data dynamically to avoid circular dependencies
      import('../data/mockData').then(({ mockLightGBM }) => {
        setResult(mockLightGBM);
      });
    } else {
      setResult(null);
    }
  };

  const handleDemoExampleChange = (example: 'lgbm' | 'cnn') => {
    import('../data/mockData').then(({ mockLightGBM, mockCNN }) => {
      if (example === 'lgbm') {
        setResult(mockLightGBM);
      } else {
        setResult(mockCNN);
      }
    });
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      setError('Please upload a file first');
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setDemoMode(false);
    setError(null);

    try {
      // Prepare form data for training
      const formData = new FormData();
      formData.append('file', uploadedFile.file);
      formData.append('model_type', parameters.model_type);
      formData.append('class_weight_penalizing', parameters.class_weight_penalizing.toString());
      formData.append('drop_fpflags', parameters.drop_fpflags.toString());

      // Call /train endpoint with user-session-id header
      console.log('Starting training...');
      const trainResponse = await fetch(`${API_BASE_URL}/train`, {
        method: 'POST',
        headers: {
          'user-session-id': userSessionId,
        },
        body: formData,
      });

      const trainResult = await trainResponse.json();

      if (!trainResponse.ok || trainResult.status === 'error') {
        const errorMsg = trainResult.message || 'Training failed';
        setError(`Training Error: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      console.log('Training completed:', trainResult);

      // Call /predict endpoint (no file needed, uses saved CSV) with user-session-id header
      console.log('Starting prediction...');
      const predictFormData = new FormData();
      predictFormData.append('model_type', parameters.model_type);
      predictFormData.append('drop_fpflags', parameters.drop_fpflags.toString());

      const predictResponse = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'user-session-id': userSessionId,
        },
        body: predictFormData,
      });

      const predictResult = await predictResponse.json();

      if (!predictResponse.ok || predictResult.status === 'error') {
        const errorMsg = predictResult.message || 'Prediction failed';
        setError(`Prediction Error: ${errorMsg}`);
        
        // Show trace if available
        if (predictResult.trace) {
          console.error('Prediction trace:', predictResult.trace);
        }
        
        throw new Error(errorMsg);
      }

      console.log('Prediction completed:', predictResult);

      // Set results (for now using mock data, replace with predictResult.results when backend is ready)
      const { mockLightGBM, mockCNN } = await import('../data/mockData');
      const mockResults = [mockLightGBM, mockCNN];
      setResult(mockResults[Math.floor(Math.random() * mockResults.length)]);

    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      
      if (!error) {
        setError(`Analysis Error: ${errorMessage}`);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCancel = () => {
    setAnalyzing(false);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setResult(null);
    setDemoMode(false);
    setError(null);
  };

  const handleViewDemo = () => {
    setDemoMode(true);
    // Load mock data
    import('../data/mockData').then(({ mockLightGBM }) => {
      setResult(mockLightGBM);
    });
  };

  const value: AppContextType = {
    uploadedFile,
    parameters,
    analyzing,
    result,
    demoMode,
    userSessionId,
    error,
    setUploadedFile,
    setParameters,
    setDemoMode,
    setError,
    handleFileUpload,
    handleValidateCSV,
    handleAnalyze,
    handleCancel,
    handleReset,
    handleDemoModeChange,
    handleDemoExampleChange,
    handleViewDemo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

