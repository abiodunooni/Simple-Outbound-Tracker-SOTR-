import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { DayPicker } from 'react-day-picker'
import * as Popover from '@radix-ui/react-popover'
import * as Checkbox from '@radix-ui/react-checkbox'
import { Calendar, Check } from 'lucide-react'
import type { FilterCondition, FilterConfig } from '../types'
import 'react-day-picker/dist/style.css'

interface FilterValueInputProps {
  condition: FilterCondition
  config?: FilterConfig
  onUpdate: (updates: Partial<FilterCondition>) => void
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
  background-color: var(--background-primary);
  color: var(--text-primary);
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const Select = styled.select`
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  background-color: var(--background-primary);
  color: var(--text-primary);
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

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
`

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
  }
  
  .rdp-day_selected {
    background-color: var(--accent-primary);
    color: white;
  }
  
  .rdp-day:hover:not(.rdp-day_selected) {
    background-color: var(--background-hover);
  }
`

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
`

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--background-hover);
  }
`

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
`

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

export const FilterValueInput: React.FC<FilterValueInputProps> = observer(({
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

  const handleMultiSelectChange = (optionValue: string, checked: boolean) => {
    const currentValues = Array.isArray(condition.value) ? condition.value : []
    let newValues
    
    if (checked) {
      newValues = [...currentValues, optionValue]
    } else {
      newValues = currentValues.filter((v: string) => v !== optionValue)
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
        <Select
          value={condition.value || ''}
          onChange={(e) => onUpdate({ value: e.target.value })}
        >
          <option value="">Select option...</option>
          {config.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
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

  // Number input (for future use)
  if (config?.dataType === 'number') {
    return (
      <InputGroup>
        <Label>Value</Label>
        <Input
          type="number"
          value={condition.value || ''}
          onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || 0 })}
          placeholder="Enter number..."
        />
      </InputGroup>
    )
  }

  return null
})