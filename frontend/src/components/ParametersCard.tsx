import { Card, CardHeader, CardBody, Select, SelectItem, Switch } from '@heroui/react';
import type { Parameters } from '../types';

interface ParametersCardProps {
  parameters: Parameters;
  onParametersChange: (parameters: Parameters) => void;
}

export function ParametersCard({
  parameters,
  onParametersChange,
}: ParametersCardProps) {
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
      <CardHeader>
        <h2 className="text-xl font-semibold text-primary-text dark:text-dark-primary-text">Parameters</h2>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <Select
            label="Model Type"
            selectedKeys={new Set([parameters.model_type])}
            onChange={(e) =>
              updateParameter('model_type', e.target.value as 'ensemble' | 'binary_categories' | 'multistep')
            }
          >
            <SelectItem key="ensemble">
              Ensemble
            </SelectItem>
            <SelectItem key="binary_categories">
              Binary Categories
            </SelectItem>
            <SelectItem key="multistep">
              Multistep
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
          >
            <span className="text-sm text-primary-text dark:text-dark-primary-text">
              Drop FP Flags
            </span>
          </Switch>
        </div>
      </CardBody>
    </Card>
  );
}
