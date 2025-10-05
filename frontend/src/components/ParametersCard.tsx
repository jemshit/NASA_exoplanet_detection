import {
  Card,
  Accordion,
  AccordionItem,
  Select,
  SelectItem,
  Slider,
  Input,
  Button,
} from '@heroui/react';
import type { Parameters } from '../types';
import { defaultParameters } from '../types';

interface ParametersCardProps {
  parameters: Parameters;
  onParametersChange: (parameters: Parameters) => void;
}

export function ParametersCard({
  parameters,
  onParametersChange,
}: ParametersCardProps) {
  const handleRestoreDefaults = () => {
    onParametersChange(defaultParameters);
  };

  const updateParameter = <K extends keyof Parameters>(
    key: K,
    value: Parameters[K]
  ) => {
    onParametersChange({ ...parameters, [key]: value });
  };

  return (
    <Card isBlurred
      className="border-none bg-surface dark:bg-dark-surface max-w-[610px] border border-border dark:border-dark-border"
      shadow="sm"
    >
      <Accordion>
        <AccordionItem
          key="params"
          aria-label="Parameters"
          title={<h2 className="text-xl font-semibold text-primary-text dark:text-dark-primary-text">Parameters</h2>}
        >
          <div className="space-y-4 pb-4">
            <Select
              label="Detrend Method"
              selectedKeys={new Set([parameters.detrend])}
              onChange={(e) =>
                updateParameter('detrend', e.target.value as 'none' | 'loess' | 'sg')
              }
            >
              <SelectItem key="none">
                None
              </SelectItem>
              <SelectItem key="loess">
                LOESS
              </SelectItem>
              <SelectItem key="sg">
                Savitzky-Golay
              </SelectItem>
            </Select>

            <Slider
              label="Window Size (days)"
              step={0.1}
              minValue={0}
              maxValue={1.5}
              value={parameters.window}
              onChange={(value) => updateParameter('window', value as number)}
              isDisabled={parameters.detrend === 'none'}
              className="max-w-full"
            />

            <Input
              type="number"
              label="Min Period (days)"
              value={parameters.pMin.toString()}
              onChange={(e) => updateParameter('pMin', parseFloat(e.target.value))}
            />

            <Input
              type="number"
              label="Max Period (days)"
              value={parameters.pMax.toString()}
              onChange={(e) => updateParameter('pMax', parseFloat(e.target.value))}
            />

            <Input
              type="number"
              label="Oversample"
              value={parameters.oversample.toString()}
              onChange={(e) =>
                updateParameter('oversample', parseInt(e.target.value))
              }
            />

            <Input
              type="number"
              label="Max Duration (hours)"
              value={parameters.maxDurationHr.toString()}
              onChange={(e) =>
                updateParameter('maxDurationHr', parseFloat(e.target.value))
              }
            />

            <Input
              type="number"
              label="Phase Bins"
              value={parameters.nPhaseBins.toString()}
              onChange={(e) =>
                updateParameter('nPhaseBins', parseInt(e.target.value))
              }
            />

            <Select
              label="Classification Model"
              selectedKeys={new Set([parameters.model])}
              onChange={(e) =>
                updateParameter('model', e.target.value as 'lgbm' | 'cnn')
              }
            >
              <SelectItem key="lgbm">
                LightGBM
              </SelectItem>
              <SelectItem key="cnn">
                CNN
              </SelectItem>
            </Select>

            <Button 
              fullWidth 
              size="sm" 
              variant="flat" 
              className="text-accent dark:text-dark-accent border-accent dark:border-dark-accent hover:bg-accent-hover dark:hover:bg-dark-accent-hover hover:text-white"
              onPress={handleRestoreDefaults}
            >
              Restore Defaults
            </Button>
          </div>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

