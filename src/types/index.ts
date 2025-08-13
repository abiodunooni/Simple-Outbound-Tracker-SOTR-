export type LeadStatus = 'Hot' | 'Warm' | 'Cold'

export type CallLogType = 'email' | 'call' | 'whatsapp' | 'conference-call' | 'physical-meeting' | 'others'

export type CallOutcome = 'connected' | 'voicemail' | 'no-answer' | 'busy' | 'meeting-scheduled' | 'not-interested' | 'callback-requested'

export type DealStage = 'new' | 'demo' | 'onboarding' | 'integrating' | 'testing' | 'live' | 'revenue-generating' | 'blocked'

export type OpportunitySize = '<$50k' | '$50k-$200k' | '$500k-$1m' | '$1m-$5m' | '>$5m'

export type Product = 'API' | 'Payments' | 'Ramp' | 'OTC'

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
  dealStage: DealStage
  opportunitySize: OpportunitySize
  products: Product[]
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
  caller: string // who made the call
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value2?: any // For between operations
  dataType: FilterDataType
}

export interface FilterOption {
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
}

export interface FilterConfig {
  field: keyof Lead
  label: string
  dataType: FilterDataType
  operators: FilterOperator[]
  options?: FilterOption[] // for select/multi-select
}