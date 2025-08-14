import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import * as Select from '@radix-ui/react-select'
import { X, ChevronDown } from 'lucide-react'
import type { CallLogFilterCondition } from '../config/callLogFilterConfig'
import { callLogFilterConfigs, getOperatorLabel } from '../config/callLogFilterConfig'
import { CallLogFilterValueInput } from './CallLogFilterValueInput'

interface CallLogFilterConditionRowProps {
  condition: CallLogFilterCondition
  isFirst: boolean
  onUpdate: (updates: Partial<CallLogFilterCondition>) => void
  onRemove: () => void
}

const ConditionRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--background-secondary);
`

const ConditionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const AndLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  background-color: var(--background-hover);
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-muted);
  margin-left: auto;
  
  &:hover {
    background-color: var(--background-hover);
    color: var(--error);
  }
`

const ConditionInputs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-end;
`

const SelectTrigger = styled(Select.Trigger)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  background-color: var(--background-primary);
  color: var(--text-primary);
  min-width: 120px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:hover {
    background-color: var(--background-hover);
  }
  
  &[data-placeholder] {
    color: var(--text-muted);
  }
`;

const SelectContent = styled(Select.Content)`
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 4px;
  z-index: 60;
  max-height: 200px;
  overflow-y: auto;
`;

const SelectItem = styled(Select.Item)`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-primary);
  border-radius: 4px;
  cursor: pointer;
  
  &:hover, &[data-highlighted] {
    background-color: var(--background-hover);
    color: var(--accent-primary);
    outline: none;
  }
  
  &[data-state="checked"] {
    background-color: var(--background-hover);
    color: var(--accent-primary);
  }
`;

const SelectIcon = styled(Select.Icon)`
  color: var(--text-muted);
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 2px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const CallLogFilterConditionRow: React.FC<CallLogFilterConditionRowProps> = observer(({
  condition,
  isFirst,
  onUpdate,
  onRemove
}) => {
  const handleFieldChange = (field: string) => {
    const config = callLogFilterConfigs.find(c => c.field === field)
    if (config) {
      // Reset operator and value when field changes
      onUpdate({
        field: field as keyof import('../types').CallLog,
        dataType: config.dataType,
        operator: config.operators[0],
        value: '',
        value2: undefined
      })
    }
  }

  const handleOperatorChange = (operator: typeof condition.operator) => {
    const updates: Partial<CallLogFilterCondition> = { operator }
    
    // Reset values when operator changes
    if (operator === 'between' || operator === 'between_dates') {
      updates.value = ''
      updates.value2 = ''
    } else {
      updates.value = ''
      updates.value2 = undefined
    }
    
    onUpdate(updates)
  }

  const currentConfig = callLogFilterConfigs.find(c => c.field === condition.field)

  return (
    <ConditionRow>
      <ConditionHeader>
        {!isFirst && <AndLabel>AND</AndLabel>}
        <RemoveButton onClick={onRemove}>
          <X size={16} />
        </RemoveButton>
      </ConditionHeader>

      <ConditionInputs>
        <InputGroup>
          <Label>Field</Label>
          <Select.Root
            value={condition.field}
            onValueChange={handleFieldChange}
          >
            <SelectTrigger>
              <Select.Value />
              <SelectIcon>
                <ChevronDown size={16} />
              </SelectIcon>
            </SelectTrigger>
            <Select.Portal>
              <SelectContent>
                <Select.Viewport>
                  {callLogFilterConfigs.map((config) => (
                    <SelectItem key={config.field} value={config.field}>
                      <Select.ItemText>{config.label}</Select.ItemText>
                    </SelectItem>
                  ))}
                </Select.Viewport>
              </SelectContent>
            </Select.Portal>
          </Select.Root>
        </InputGroup>

        <InputGroup>
          <Label>Operator</Label>
          <Select.Root
            value={condition.operator}
            onValueChange={(value) => handleOperatorChange(value as typeof condition.operator)}
          >
            <SelectTrigger>
              <Select.Value />
              <SelectIcon>
                <ChevronDown size={16} />
              </SelectIcon>
            </SelectTrigger>
            <Select.Portal>
              <SelectContent>
                <Select.Viewport>
                  {currentConfig?.operators.map((operator) => (
                    <SelectItem key={operator} value={operator}>
                      <Select.ItemText>{getOperatorLabel(operator)}</Select.ItemText>
                    </SelectItem>
                  ))}
                </Select.Viewport>
              </SelectContent>
            </Select.Portal>
          </Select.Root>
        </InputGroup>

        <CallLogFilterValueInput
          condition={condition}
          config={currentConfig}
          onUpdate={onUpdate}
        />
      </ConditionInputs>
    </ConditionRow>
  )
})