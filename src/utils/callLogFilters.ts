import type { CallLog } from '../types'
import type { CallLogFilterCondition } from '../config/callLogFilterConfig'

export const applyCallLogFilters = (callLogs: CallLog[], filters: CallLogFilterCondition[]): CallLog[] => {
  if (filters.length === 0) {
    return callLogs
  }

  return callLogs.filter((callLog) => {
    // All filters must pass (AND logic)
    return filters.every((filter) => {
      const fieldValue = callLog[filter.field]
      return evaluateCondition(fieldValue, filter)
    })
  })
}

const evaluateCondition = (fieldValue: any, condition: CallLogFilterCondition): boolean => {
  const { operator, value, value2 } = condition

  // Handle null/undefined values
  if (fieldValue == null) {
    switch (operator) {
      case 'is_empty':
        return true
      case 'is_not_empty':
        return false
      default:
        return false
    }
  }

  // Handle empty string values
  if (typeof fieldValue === 'string' && fieldValue.trim() === '') {
    switch (operator) {
      case 'is_empty':
        return true
      case 'is_not_empty':
        return false
      default:
        return false
    }
  }

  switch (operator) {
    case 'equals':
      return fieldValue === value

    case 'not_equals':
      return fieldValue !== value

    case 'contains':
      return typeof fieldValue === 'string' && 
             typeof value === 'string' && 
             fieldValue.toLowerCase().includes(value.toLowerCase())

    case 'not_contains':
      return typeof fieldValue === 'string' && 
             typeof value === 'string' && 
             !fieldValue.toLowerCase().includes(value.toLowerCase())

    case 'starts_with':
      return typeof fieldValue === 'string' && 
             typeof value === 'string' && 
             fieldValue.toLowerCase().startsWith(value.toLowerCase())

    case 'ends_with':
      return typeof fieldValue === 'string' && 
             typeof value === 'string' && 
             fieldValue.toLowerCase().endsWith(value.toLowerCase())

    case 'is_empty':
      return fieldValue == null || 
             (typeof fieldValue === 'string' && fieldValue.trim() === '')

    case 'is_not_empty':
      return fieldValue != null && 
             !(typeof fieldValue === 'string' && fieldValue.trim() === '')

    case 'greater_than':
      return typeof fieldValue === 'number' && 
             typeof value === 'number' && 
             fieldValue > value

    case 'less_than':
      return typeof fieldValue === 'number' && 
             typeof value === 'number' && 
             fieldValue < value

    case 'greater_equal':
      return typeof fieldValue === 'number' && 
             typeof value === 'number' && 
             fieldValue >= value

    case 'less_equal':
      return typeof fieldValue === 'number' && 
             typeof value === 'number' && 
             fieldValue <= value

    case 'between':
      return typeof fieldValue === 'number' && 
             typeof value === 'number' && 
             typeof value2 === 'number' && 
             fieldValue >= value && 
             fieldValue <= value2

    case 'in':
      return Array.isArray(value) && value.includes(fieldValue)

    case 'not_in':
      return Array.isArray(value) && !value.includes(fieldValue)

    case 'before':
      if (fieldValue instanceof Date && value instanceof Date) {
        return fieldValue < value
      }
      return false

    case 'after':
      if (fieldValue instanceof Date && value instanceof Date) {
        return fieldValue > value
      }
      return false

    case 'equals_date':
      if (fieldValue instanceof Date && value instanceof Date) {
        return fieldValue.toDateString() === value.toDateString()
      }
      return false

    case 'between_dates':
      if (fieldValue instanceof Date && value instanceof Date && value2 instanceof Date) {
        return fieldValue >= value && fieldValue <= value2
      }
      return false

    default:
      return false
  }
}