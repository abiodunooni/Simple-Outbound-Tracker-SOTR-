import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { DayPicker } from 'react-day-picker'
import * as Popover from '@radix-ui/react-popover'
import * as Checkbox from '@radix-ui/react-checkbox'
import { Calendar, Check } from 'lucide-react'
import type { CompanyFilterCondition, CompanyFilterConfig } from '../types'
import 'react-day-picker/dist/style.css'

interface CompanyFilterValueInputProps {
  condition: CompanyFilterCondition
  fieldConfig?: CompanyFilterConfig
  onUpdate: (updates: Partial<CompanyFilterCondition>) => void
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
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const CheckboxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--background-primary);
  min-width: 200px;
`

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  
  &:hover {
    background-color: var(--background-hover);
  }
`

const StyledCheckbox = styled(Checkbox.Root)`
  all: unset;
  background-color: white;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border-color);
  
  &[data-state='checked'] {
    background-color: var(--accent-primary);
    border-color: var(--accent-primary);
  }
  
  &:focus {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`

const StyledCheckboxIndicator = styled(Checkbox.Indicator)`
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`

const DateInputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const CalendarTrigger = styled.button`
  all: unset;
  padding: 6px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: var(--background-primary);
  
  &:hover {
    background-color: var(--background-hover);
  }
  
  &:focus {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`

const PopoverContent = styled(Popover.Content)`
  background-color: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 1003;
`

export const CompanyFilterValueInput: React.FC<CompanyFilterValueInputProps> = observer(({ 
  condition, 
  fieldConfig,
  onUpdate 
}) => {
  const isDateOperator = ['before', 'after', 'equals_date', 'between_dates'].includes(condition.operator)
  const isEmptyOperator = ['is_empty', 'is_not_empty'].includes(condition.operator)
  const isMultiSelectOperator = ['in', 'not_in'].includes(condition.operator)

  // Don't show input for empty/not empty operators
  if (isEmptyOperator) {
    return null
  }

  const handleInputChange = (value: string) => {
    onUpdate({ value })
  }


  const handleDateChange = (date: Date | undefined) => {
    onUpdate({ value: date })
  }

  const handleDate2Change = (date: Date | undefined) => {
    onUpdate({ value2: date })
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-CA') // YYYY-MM-DD format
  }

  const parseDate = (dateString: string) => {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? undefined : date
  }

  // Date inputs
  if (isDateOperator) {
    if (condition.operator === 'between_dates') {
      return (
        <DateInputContainer>
          <InputGroup>
            <Label>From</Label>
            <DateInputContainer>
              <Input
                type="date"
                value={condition.value instanceof Date ? formatDate(condition.value) : ''}
                onChange={(e) => handleDateChange(parseDate(e.target.value))}
              />
              <Popover.Root>
                <Popover.Trigger asChild>
                  <CalendarTrigger type="button">
                    <Calendar size={14} />
                  </CalendarTrigger>
                </Popover.Trigger>
                <Popover.Portal>
                  <PopoverContent>
                    <DayPicker
                      mode="single"
                      selected={condition.value instanceof Date ? condition.value : undefined}
                      onSelect={handleDateChange}
                    />
                  </PopoverContent>
                </Popover.Portal>
              </Popover.Root>
            </DateInputContainer>
          </InputGroup>
          
          <InputGroup>
            <Label>To</Label>
            <DateInputContainer>
              <Input
                type="date"
                value={condition.value2 instanceof Date ? formatDate(condition.value2) : ''}
                onChange={(e) => handleDate2Change(parseDate(e.target.value))}
              />
              <Popover.Root>
                <Popover.Trigger asChild>
                  <CalendarTrigger type="button">
                    <Calendar size={14} />
                  </CalendarTrigger>
                </Popover.Trigger>
                <Popover.Portal>
                  <PopoverContent>
                    <DayPicker
                      mode="single"
                      selected={condition.value2 instanceof Date ? condition.value2 : undefined}
                      onSelect={handleDate2Change}
                    />
                  </PopoverContent>
                </Popover.Portal>
              </Popover.Root>
            </DateInputContainer>
          </InputGroup>
        </DateInputContainer>
      )
    }

    return (
      <DateInputContainer>
        <Input
          type="date"
          value={condition.value instanceof Date ? formatDate(condition.value) : ''}
          onChange={(e) => handleDateChange(parseDate(e.target.value))}
        />
        <Popover.Root>
          <Popover.Trigger asChild>
            <CalendarTrigger type="button">
              <Calendar size={14} />
            </CalendarTrigger>
          </Popover.Trigger>
          <Popover.Portal>
            <PopoverContent>
              <DayPicker
                mode="single"
                selected={condition.value instanceof Date ? condition.value : undefined}
                onSelect={handleDateChange}
              />
            </PopoverContent>
          </Popover.Portal>
        </Popover.Root>
      </DateInputContainer>
    )
  }

  // Multi-select (checkboxes)
  if (isMultiSelectOperator && fieldConfig?.options) {
    const selectedValues = Array.isArray(condition.value) ? condition.value : []
    
    return (
      <CheckboxList>
        {fieldConfig.options.map((option) => (
          <CheckboxItem key={option.value}>
            <StyledCheckbox
              checked={selectedValues.includes(option.value)}
              onCheckedChange={(checked) => 
                handleMultiSelectChange(option.value, checked === true)
              }
            >
              <StyledCheckboxIndicator>
                <Check size={12} />
              </StyledCheckboxIndicator>
            </StyledCheckbox>
            <span>{option.label}</span>
          </CheckboxItem>
        ))}
      </CheckboxList>
    )
  }

  // Single select dropdown
  if (fieldConfig?.dataType === 'select' && fieldConfig.options) {
    return (
      <Select
        value={condition.value || ''}
        onChange={(e) => handleInputChange(e.target.value)}
      >
        <option value="">Select...</option>
        {fieldConfig.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    )
  }

  // Text input (default)
  return (
    <Input
      type="text"
      value={condition.value || ''}
      onChange={(e) => handleInputChange(e.target.value)}
      placeholder="Enter value..."
    />
  )
})