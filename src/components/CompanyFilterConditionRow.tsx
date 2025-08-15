import { observer } from "mobx-react-lite";
import styled from "styled-components";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, X } from "lucide-react";
import type { CompanyFilterCondition, Company } from "../types";
import { companyFilterConfigs, getCompanyFilterConfig } from "../config/companyFilterConfig";
import { getOperatorLabel } from "../config/filterConfig";
import { CompanyFilterValueInput } from "./CompanyFilterValueInput";

interface CompanyFilterConditionRowProps {
  condition: CompanyFilterCondition;
  isFirst: boolean;
  onUpdate: (updates: Partial<CompanyFilterCondition>) => void;
  onRemove: () => void;
}

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
`;

const LogicSelector = styled.div`
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  min-width: 40px;
`;

const SelectTrigger = styled(Select.Trigger)`
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 12px;
  line-height: 1;
  height: 28px;
  gap: 4px;
  background-color: var(--background-primary);
  color: var(--text-primary);
  cursor: pointer;
  min-width: 100px;

  &:focus {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const SelectContent = styled(Select.Content)`
  overflow: hidden;
  background-color: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  z-index: 1002;
`;

const SelectViewport = styled(Select.Viewport)`
  padding: 5px;
`;

const SelectItem = styled(Select.Item)`
  all: unset;
  font-size: 12px;
  line-height: 1;
  color: var(--text-primary);
  border-radius: 3px;
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 25px 0 15px;
  position: relative;
  user-select: none;
  cursor: pointer;

  &[data-highlighted] {
    outline: none;
    background-color: var(--background-hover);
  }
`;

const RemoveButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 3px;
  color: var(--text-muted);
  cursor: pointer;

  &:hover {
    background-color: var(--background-hover);
    color: var(--error);
  }
`;

export const CompanyFilterConditionRow: React.FC<CompanyFilterConditionRowProps> = observer(
  ({ condition, isFirst, onUpdate, onRemove }) => {
    const fieldConfig = getCompanyFilterConfig(condition.field);
    const availableOperators = fieldConfig?.operators || [];

    const handleFieldChange = (field: string) => {
      const newFieldConfig = getCompanyFilterConfig(field as keyof Company);
      if (newFieldConfig) {
        onUpdate({
          field: field as keyof Company,
          operator: newFieldConfig.operators[0],
          value: "",
          value2: undefined,
          dataType: newFieldConfig.dataType,
        });
      }
    };

    const handleOperatorChange = (operator: string) => {
      onUpdate({
        operator: operator as typeof condition.operator,
        value: "",
        value2: undefined,
      });
    };

    return (
      <FilterRow>
        <LogicSelector>{isFirst ? "Where" : "And"}</LogicSelector>

        {/* Field Selector */}
        <Select.Root value={condition.field} onValueChange={handleFieldChange}>
          <SelectTrigger>
            <Select.Value />
            <Select.Icon>
              <ChevronDown size={12} />
            </Select.Icon>
          </SelectTrigger>
          <Select.Portal>
            <SelectContent>
              <SelectViewport>
                {companyFilterConfigs.map((config) => (
                  <SelectItem key={config.field} value={config.field}>
                    <Select.ItemText>{config.label}</Select.ItemText>
                  </SelectItem>
                ))}
              </SelectViewport>
            </SelectContent>
          </Select.Portal>
        </Select.Root>

        {/* Operator Selector */}
        <Select.Root value={condition.operator} onValueChange={handleOperatorChange}>
          <SelectTrigger>
            <Select.Value />
            <Select.Icon>
              <ChevronDown size={12} />
            </Select.Icon>
          </SelectTrigger>
          <Select.Portal>
            <SelectContent>
              <SelectViewport>
                {availableOperators.map((operator) => (
                  <SelectItem key={operator} value={operator}>
                    <Select.ItemText>{getOperatorLabel(operator)}</Select.ItemText>
                  </SelectItem>
                ))}
              </SelectViewport>
            </SelectContent>
          </Select.Portal>
        </Select.Root>

        {/* Value Input */}
        <CompanyFilterValueInput
          condition={condition}
          fieldConfig={fieldConfig}
          onUpdate={onUpdate}
        />

        {/* Remove Button */}
        <RemoveButton onClick={onRemove}>
          <X size={14} />
        </RemoveButton>
      </FilterRow>
    );
  }
);