import type { CompanyFilterConfig, Company } from '../types'

export const companyFilterConfigs: CompanyFilterConfig[] = [
  // Text fields
  {
    field: 'name',
    label: 'Company Name',
    dataType: 'text',
    operators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },
  {
    field: 'website',
    label: 'Website',
    dataType: 'text',
    operators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },
  {
    field: 'location',
    label: 'Location',
    dataType: 'text',
    operators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },
  {
    field: 'description',
    label: 'Description',
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
    field: 'industry',
    label: 'Industry',
    dataType: 'select',
    operators: ['equals', 'not_equals', 'in', 'not_in'],
    options: [
      { label: 'Fintech', value: 'fintech' },
      { label: 'E-commerce', value: 'e-commerce' },
      { label: 'Healthcare', value: 'healthcare' },
      { label: 'Education', value: 'education' },
      { label: 'Gaming', value: 'gaming' },
      { label: 'Logistics', value: 'logistics' },
      { label: 'Real Estate', value: 'real-estate' },
      { label: 'Government', value: 'government' },
      { label: 'Non-profit', value: 'non-profit' },
      { label: 'Other', value: 'other' }
    ]
  },
  {
    field: 'size',
    label: 'Company Size',
    dataType: 'select',
    operators: ['equals', 'not_equals', 'in', 'not_in'],
    options: [
      { label: 'Startup', value: 'startup' },
      { label: 'Small', value: 'small' },
      { label: 'Medium', value: 'medium' },
      { label: 'Large', value: 'large' },
      { label: 'Enterprise', value: 'enterprise' }
    ]
  },
  {
    field: 'accountOwner',
    label: 'Account Owner',
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
export const getCompanyFilterConfig = (field: keyof Company): CompanyFilterConfig | undefined => {
  return companyFilterConfigs.find(config => config.field === field)
}