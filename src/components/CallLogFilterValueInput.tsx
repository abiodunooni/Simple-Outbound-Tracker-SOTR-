/* eslint-disable @typescript-eslint/no-explicit-any */
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import * as Select from '@radix-ui/react-select'
import * as Checkbox from '@radix-ui/react-checkbox'
import * as Popover from '@radix-ui/react-popover'
import { DayPicker } from 'react-day-picker'
import { ChevronDown, Calendar, Check } from 'lucide-react'
import type { CallLogFilterCondition, CallLogFilterConfig } from '../config/callLogFilterConfig'
import 'react-day-picker/dist/style.css'

interface CallLogFilterValueInputProps {
  condition: CallLogFilterCondition
  config?: CallLogFilterConfig
  onUpdate: (updates: Partial<CallLogFilterCondition>) => void
}

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Label = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 2px;
`

const Input = styled.input`
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-primary);
  background-color: var(--background-primary);
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
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
  min-width: 150px;
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

const DateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  background-color: var(--background-primary);
  color: var(--text-primary);
  cursor: pointer;
  min-width: 150px;
  text-align: left;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:hover {
    background-color: var(--background-hover);
  }
`;

const DatePickerPopover = styled(Popover.Content)`
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 60;
  
  .rdp {
    margin: 0;
  }
  
  .rdp-caption_label {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .rdp-day {
    color: var(--text-primary);
  }
  
  .rdp-day_selected {
    background-color: var(--accent-primary);
    color: white;
  }
  
  .rdp-day:hover:not(.rdp-day_selected) {
    background-color: var(--background-hover);
  }
`;

const MultiSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 8px;
  background-color: var(--background-primary);
  min-width: 150px;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-primary);
  
  &:hover {
    background-color: var(--background-hover);
  }
`;

const CheckboxRoot = styled(Checkbox.Root)`
  width: 16px;
  height: 16px;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  background-color: var(--background-primary);
  cursor: pointer;
  
  &:hover {
    border-color: var(--accent-primary);
  }
  
  &[data-state="checked"] {
    background-color: var(--accent-primary);
    border-color: var(--accent-primary);
  }
`;

const CheckboxIndicator = styled(Checkbox.Indicator)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`

const BetweenInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const CallLogFilterValueInput: React.FC<CallLogFilterValueInputProps> = observer(({
  condition,
  config,
  onUpdate
}) => {
  // Don't show input for operators that don't need values
  if (condition.operator === 'is_empty' || condition.operator === 'is_not_empty') {
    return null
  }

  const formatDateValue = (date: Date | null) => {
    if (!date) return 'Select date'
    return date.toLocaleDateString()
  }

  const handleDateSelect = (date: Date | undefined, isSecondValue = false) => {
    if (isSecondValue) {
      onUpdate({ value2: date || null })
    } else {
      onUpdate({ value: date || null })
    }
  }

  const handleMultiSelectChange = (optionValue: any, checked: boolean) => {
    const currentValues = Array.isArray(condition.value) ? condition.value : []
    let newValues
    
    if (checked) {
      newValues = [...currentValues, optionValue]
    } else {
      newValues = currentValues.filter((v: any) => v !== optionValue)
    }
    
    onUpdate({ value: newValues })
  }

  // Text input
  if (config?.dataType === 'text') {
    return (
      <InputGroup>
        <Label>Value</Label>
        <Input
          type="text"
          value={condition.value || ''}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="Enter text..."
        />
      </InputGroup>
    )
  }

  // Single select
  if (config?.dataType === 'select' && (condition.operator === 'equals' || condition.operator === 'not_equals')) {
    return (
      <InputGroup>
        <Label>Value</Label>
        <Select.Root
          value={condition.value || ''}
          onValueChange={(value) => onUpdate({ value })}
        >
          <SelectTrigger>
            <Select.Value placeholder="Select option..." />
            <SelectIcon>
              <ChevronDown size={16} />
            </SelectIcon>
          </SelectTrigger>
          <Select.Portal>
            <SelectContent>
              <Select.Viewport>
                {config.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </SelectItem>
                ))}
              </Select.Viewport>
            </SelectContent>
          </Select.Portal>
        </Select.Root>
      </InputGroup>
    )
  }

  // Multi-select
  if (config?.dataType === 'select' && (condition.operator === 'in' || condition.operator === 'not_in')) {
    const selectedValues = Array.isArray(condition.value) ? condition.value : []
    
    return (
      <InputGroup>
        <Label>Values</Label>
        <MultiSelectContainer>
          {config.options?.map((option) => (
            <CheckboxItem key={option.value}>
              <CheckboxRoot
                checked={selectedValues.includes(option.value)}
                onCheckedChange={(checked) => 
                  handleMultiSelectChange(option.value, checked === true)
                }
              >
                <CheckboxIndicator>
                  <Check size={12} />
                </CheckboxIndicator>
              </CheckboxRoot>
              <span>{option.label}</span>
            </CheckboxItem>
          ))}
        </MultiSelectContainer>
      </InputGroup>
    )
  }

  // Date inputs
  if (config?.dataType === 'date') {
    if (condition.operator === 'between_dates') {
      return (
        <BetweenInputs>
          <InputGroup>
            <Label>From Date</Label>
            <Popover.Root>
              <Popover.Trigger asChild>
                <DateButton>
                  <Calendar size={16} />
                  {formatDateValue(condition.value)}
                </DateButton>
              </Popover.Trigger>
              <Popover.Portal>
                <DatePickerPopover>
                  <DayPicker
                    mode="single"
                    selected={condition.value}
                    onSelect={(date) => handleDateSelect(date)}
                    showOutsideDays
                  />
                </DatePickerPopover>
              </Popover.Portal>
            </Popover.Root>
          </InputGroup>

          <InputGroup>
            <Label>To Date</Label>
            <Popover.Root>
              <Popover.Trigger asChild>
                <DateButton>
                  <Calendar size={16} />
                  {formatDateValue(condition.value2)}
                </DateButton>
              </Popover.Trigger>
              <Popover.Portal>
                <DatePickerPopover>
                  <DayPicker
                    mode="single"
                    selected={condition.value2}
                    onSelect={(date) => handleDateSelect(date, true)}
                    showOutsideDays
                  />
                </DatePickerPopover>
              </Popover.Portal>
            </Popover.Root>
          </InputGroup>
        </BetweenInputs>
      )
    }

    // Single date
    return (
      <InputGroup>
        <Label>Date</Label>
        <Popover.Root>
          <Popover.Trigger asChild>
            <DateButton>
              <Calendar size={16} />
              {formatDateValue(condition.value)}
            </DateButton>
          </Popover.Trigger>
          <Popover.Portal>
            <DatePickerPopover>
              <DayPicker
                mode="single"
                selected={condition.value}
                onSelect={(date) => handleDateSelect(date)}
                showOutsideDays
              />
            </DatePickerPopover>
          </Popover.Portal>
        </Popover.Root>
      </InputGroup>
    )
  }

  // Number input with between handling
  if (config?.dataType === 'number') {
    if (condition.operator === 'between') {
      return (
        <BetweenInputs>
          <InputGroup>
            <Label>From</Label>
            <Input
              type="number"
              value={condition.value || ''}
              onChange={(e) => onUpdate({ value: Number(e.target.value) || 0 })}
              placeholder="Min value"
            />
          </InputGroup>
          <InputGroup>
            <Label>To</Label>
            <Input
              type="number"
              value={condition.value2 || ''}
              onChange={(e) => onUpdate({ value2: Number(e.target.value) || 0 })}
              placeholder="Max value"
            />
          </InputGroup>
        </BetweenInputs>
      )
    }

    return (
      <InputGroup>
        <Label>Value</Label>
        <Input
          type="number"
          value={condition.value || ''}
          onChange={(e) => onUpdate({ value: Number(e.target.value) || 0 })}
          placeholder="Enter number..."
        />
      </InputGroup>
    )
  }

  return null
})