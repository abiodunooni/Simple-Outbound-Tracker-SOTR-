export type LeadStatus = 'Hot' | 'Warm' | 'Cold'

export type CallLogType = 'email' | 'call' | 'whatsapp' | 'conference-call' | 'physical-meeting' | 'others'

export type CallOutcome = 'connected' | 'voicemail' | 'no-answer' | 'busy' | 'meeting-scheduled' | 'not-interested' | 'callback-requested'

export interface Lead {
  id: string
  name: string
  company: string
  phone: string
  email: string
  status: LeadStatus
  notes: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  accountOwner: string
  lastContactedAt: Date | null
}

export interface CallLog {
  id: string
  leadId: string
  type: CallLogType
  date: Date
  duration?: number // in minutes - optional for some communication types
  outcome?: CallOutcome // optional for some communication types
  notes: string
  otherPeople: string // comma-separated list of other people involved
  nextAction?: string // optional
  scheduledFollowUp?: Date | null // optional
}

export interface DashboardMetrics {
  totalLeads: number
  callsToday: number
  callsThisWeek: number
  hotLeads: number
  warmLeads: number
  coldLeads: number
  avgCallsPerDay: number
  conversionRate: number
}

// Filter system types
export type FilterOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains'
  | 'starts_with' 
  | 'ends_with' 
  | 'is_empty' 
  | 'is_not_empty'
  | 'greater_than' 
  | 'less_than' 
  | 'greater_equal' 
  | 'less_equal'
  | 'between' 
  | 'in' 
  | 'not_in' 
  | 'before' 
  | 'after'
  | 'equals_date'
  | 'between_dates'

export type FilterDataType = 'text' | 'select' | 'multi-select' | 'date' | 'number' | 'boolean'

export interface FilterCondition {
  id: string
  field: keyof Lead
  operator: FilterOperator
  value: any
  value2?: any // For between operations
  dataType: FilterDataType
}

export interface FilterOption {
  label: string
  value: any
}

export interface FilterConfig {
  field: keyof Lead
  label: string
  dataType: FilterDataType
  operators: FilterOperator[]
  options?: FilterOption[] // for select/multi-select
}