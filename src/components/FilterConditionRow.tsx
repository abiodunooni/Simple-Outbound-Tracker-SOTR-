import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { X } from 'lucide-react'
import type { FilterCondition } from '../types'
import { filterConfigs, getOperatorLabel } from '../config/filterConfig'
import { FilterValueInput } from './FilterValueInput'

interface FilterConditionRowProps {
  condition: FilterCondition
  isFirst: boolean
  onUpdate: (updates: Partial<FilterCondition>) => void
  onRemove: () => void
}

const ConditionRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: #f8fafc;
`

const ConditionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const AndLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background-color: #e5e7eb;
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
  color: #6b7280;
  margin-left: auto;
  
  &:hover {
    background-color: #fee2e2;
    color: #dc2626;
  }
`

const ConditionInputs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-end;
`

const Select = styled.select`
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  color: #374151;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const Label = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 2px;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const FilterConditionRow: React.FC<FilterConditionRowProps> = observer(({
  condition,
  isFirst,
  onUpdate,
  onRemove
}) => {
  const handleFieldChange = (field: string) => {
    const config = filterConfigs.find(c => c.field === field)
    if (config) {
      // Reset operator and value when field changes
      onUpdate({
        field: field as keyof import('../types').Lead,
        dataType: config.dataType,
        operator: config.operators[0],
        value: '',
        value2: undefined
      })
    }
  }

  const handleOperatorChange = (operator: typeof condition.operator) => {
    const updates: Partial<FilterCondition> = { operator }
    
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

  const currentConfig = filterConfigs.find(c => c.field === condition.field)

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
          <Select
            value={condition.field}
            onChange={(e) => handleFieldChange(e.target.value)}
          >
            {filterConfigs.map((config) => (
              <option key={config.field} value={config.field}>
                {config.label}
              </option>
            ))}
          </Select>
        </InputGroup>

        <InputGroup>
          <Label>Operator</Label>
          <Select
            value={condition.operator}
            onChange={(e) => handleOperatorChange(e.target.value as typeof condition.operator)}
          >
            {currentConfig?.operators.map((operator) => (
              <option key={operator} value={operator}>
                {getOperatorLabel(operator)}
              </option>
            ))}
          </Select>
        </InputGroup>

        <FilterValueInput
          condition={condition}
          config={currentConfig}
          onUpdate={onUpdate}
        />
      </ConditionInputs>
    </ConditionRow>
  )
})