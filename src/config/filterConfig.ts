import type { FilterConfig } from '../types'

export const filterConfigs: FilterConfig[] = [
  // Text fields
  {
    field: 'name',
    label: 'Name',
    dataType: 'text',
    operators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },
  {
    field: 'company',
    label: 'Company',
    dataType: 'text',
    operators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },
  {
    field: 'email',
    label: 'Email',
    dataType: 'text',
    operators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },
  {
    field: 'phone',
    label: 'Phone',
    dataType: 'text',
    operators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },
  {
    field: 'notes',
    label: 'Notes',
    dataType: 'text',
    operators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },

  // Select fields
  {
    field: 'status',
    label: 'Status',
    dataType: 'select',
    operators: ['equals', 'not_equals', 'in', 'not_in'],
    options: [
      { label: 'Hot', value: 'Hot' },
      { label: 'Warm', value: 'Warm' },
      { label: 'Cold', value: 'Cold' }
    ]
  },
  {
    field: 'createdBy',
    label: 'Created By',
    dataType: 'select',
    operators: ['equals', 'not_equals', 'in', 'not_in'],
    options: [
      { label: 'Sammy', value: 'Sammy' }
    ]
  },

  // Date fields
  {
    field: 'createdAt',
    label: 'Created At',
    dataType: 'date',
    operators: ['before', 'after', 'equals_date', 'between_dates']
  },
  {
    field: 'updatedAt',
    label: 'Updated At',
    dataType: 'date',
    operators: ['before', 'after', 'equals_date', 'between_dates']
  },
  {
    field: 'lastContactedAt',
    label: 'Last Contacted',
    dataType: 'date',
    operators: ['before', 'after', 'equals_date', 'between_dates', 'is_empty', 'is_not_empty']
  }
]

// Helper function to get filter config by field name
export const getFilterConfig = (field: keyof import('../types').Lead): FilterConfig | undefined => {
  return filterConfigs.find(config => config.field === field)
}

// Helper function to get operator label
export const getOperatorLabel = (operator: import('../types').FilterOperator): string => {
  const operatorLabels: Record<import('../types').FilterOperator, string> = {
    equals: 'equals',
    not_equals: 'does not equal',
    contains: 'contains',
    not_contains: 'does not contain',
    starts_with: 'starts with',
    ends_with: 'ends with',
    is_empty: 'is empty',
    is_not_empty: 'is not empty',
    greater_than: 'greater than',
    less_than: 'less than',
    greater_equal: 'greater than or equal',
    less_equal: 'less than or equal',
    between: 'between',
    in: 'is one of',
    not_in: 'is not one of',
    before: 'before',
    after: 'after',
    equals_date: 'on date',
    between_dates: 'between dates'
  }
  
  return operatorLabels[operator] || operator
}