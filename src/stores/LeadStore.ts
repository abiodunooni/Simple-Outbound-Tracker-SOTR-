import { makeAutoObservable, runInAction } from 'mobx'
import type { Lead, LeadStatus, FilterCondition } from '../types'
import { LocalStorageManager, STORAGE_KEYS } from '../utils/localStorage'

export class LeadStore {
  leads: Lead[] = []
  loading = false
  searchQuery = ''
  statusFilter: LeadStatus | 'all' = 'all'
  sortBy: 'name' | 'company' | 'createdAt' | 'updatedAt' | 'lastContactedAt' = 'createdAt'
  sortOrder: 'asc' | 'desc' = 'desc'
  filters: FilterCondition[] = []

  constructor() {
    makeAutoObservable(this)
    this.loadLeads()
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  private saveLeads(): void {
    LocalStorageManager.setItem(STORAGE_KEYS.LEADS, this.leads)
  }

  loadLeads(): void {
    this.loading = true
    try {
      const savedLeads = LocalStorageManager.getItem<Lead[]>(STORAGE_KEYS.LEADS, [])
      runInAction(() => {
        this.leads = savedLeads
        this.loading = false
      })
    } catch {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  checkEmailExists(email: string, excludeId?: string): boolean {
    return this.leads.some(lead => 
      lead.email.toLowerCase() === email.toLowerCase() && 
      lead.id !== excludeId
    )
  }

  // Helper function to normalize phone numbers for comparison
  private normalizePhone(phone: string): string {
    // Remove all non-digit characters except +
    return phone.replace(/[^\d+]/g, '')
  }

  checkSimilarPhone(phone: string, excludeId?: string): Lead | null {
    if (!phone.trim()) return null
    
    const normalizedInput = this.normalizePhone(phone)
    if (normalizedInput.length < 7) return null // Too short to be meaningful
    
    return this.leads.find(lead => {
      if (lead.id === excludeId || !lead.phone.trim()) return false
      
      const normalizedLeadPhone = this.normalizePhone(lead.phone)
      if (normalizedLeadPhone.length < 7) return false
      
      // Check if phones are identical after normalization
      if (normalizedInput === normalizedLeadPhone) return true
      
      // Check if one phone contains the other (for cases like +1234567890 vs 234567890)
      const minLength = Math.min(normalizedInput.length, normalizedLeadPhone.length)
      if (minLength >= 7) {
        const inputSuffix = normalizedInput.slice(-minLength)
        const leadSuffix = normalizedLeadPhone.slice(-minLength)
        return inputSuffix === leadSuffix
      }
      
      return false
    }) || null
  }

  addLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastContactedAt' | 'accountOwner'>): { success: boolean; lead?: Lead; error?: string } {
    // Check for duplicate email
    if (this.checkEmailExists(leadData.email)) {
      return {
        success: false,
        error: 'A lead with this email already exists'
      }
    }

    const newLead: Lead = {
      ...leadData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Sammy', // Default user for demo
      accountOwner: 'Sammy', // Default to creator
      lastContactedAt: null
    }

    this.leads.push(newLead)
    this.saveLeads()
    return { success: true, lead: newLead }
  }

  updateLead(id: string, updates: Partial<Omit<Lead, 'id' | 'createdAt' | 'createdBy'>>): boolean {
    const leadIndex = this.leads.findIndex(lead => lead.id === id)
    if (leadIndex === -1) return false

    this.leads[leadIndex] = { 
      ...this.leads[leadIndex], 
      ...updates,
      updatedAt: new Date()
    }
    this.saveLeads()
    return true
  }

  deleteLead(id: string): boolean {
    const initialLength = this.leads.length
    this.leads = this.leads.filter(lead => lead.id !== id)
    const wasDeleted = this.leads.length < initialLength
    if (wasDeleted) {
      this.saveLeads()
    }
    return wasDeleted
  }

  deleteLeads(ids: string[]): number {
    const initialLength = this.leads.length
    this.leads = this.leads.filter(lead => !ids.includes(lead.id))
    const deletedCount = initialLength - this.leads.length
    if (deletedCount > 0) {
      this.saveLeads()
    }
    return deletedCount
  }

  getLeadById(id: string): Lead | undefined {
    return this.leads.find(lead => lead.id === id)
  }

  updateLastContacted(id: string, date: Date = new Date()): void {
    this.updateLead(id, { lastContactedAt: date })
  }

  setSearchQuery(query: string): void {
    this.searchQuery = query
  }

  setStatusFilter(status: LeadStatus | 'all'): void {
    this.statusFilter = status
  }

  setSorting(sortBy: typeof this.sortBy, sortOrder: typeof this.sortOrder): void {
    this.sortBy = sortBy
    this.sortOrder = sortOrder
  }

  addFilter(condition: FilterCondition): void {
    this.filters.push(condition)
  }

  updateFilter(id: string, updates: Partial<FilterCondition>): void {
    const index = this.filters.findIndex(filter => filter.id === id)
    if (index !== -1) {
      this.filters[index] = { ...this.filters[index], ...updates }
    }
  }

  removeFilter(id: string): void {
    this.filters = this.filters.filter(filter => filter.id !== id)
  }

  clearFilters(): void {
    this.filters = []
  }

  get filteredAndSortedLeads(): Lead[] {
    let filtered = this.leads

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase()
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(query) ||
        lead.company.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.phone.includes(query)
      )
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === this.statusFilter)
    }

    // Apply custom filters
    filtered = this.applyFilters(filtered)

    // Apply sorting
    const sorted = filtered.slice().sort((a, b) => {
      const aValue = a[this.sortBy]
      const bValue = b[this.sortBy]

      if (aValue instanceof Date && bValue instanceof Date) {
        const aTime = aValue.getTime()
        const bTime = bValue.getTime()
        if (aTime < bTime) return this.sortOrder === 'asc' ? -1 : 1
        if (aTime > bTime) return this.sortOrder === 'asc' ? 1 : -1
        return 0
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aLower = aValue.toLowerCase()
        const bLower = bValue.toLowerCase()
        if (aLower < bLower) return this.sortOrder === 'asc' ? -1 : 1
        if (aLower > bLower) return this.sortOrder === 'asc' ? 1 : -1
        return 0
      }

      // Handle null values
      if (aValue === null && bValue === null) return 0
      if (aValue === null) return this.sortOrder === 'asc' ? -1 : 1
      if (bValue === null) return this.sortOrder === 'asc' ? 1 : -1
      
      return 0
    })

    return sorted
  }

  private applyFilters(leads: Lead[]): Lead[] {
    if (this.filters.length === 0) {
      return leads
    }

    return leads.filter(lead => 
      this.filters.every(filter => this.matchesFilter(lead, filter))
    )
  }

  private matchesFilter(lead: Lead, filter: FilterCondition): boolean {
    const fieldValue = lead[filter.field]
    const filterValue = filter.value
    const filterValue2 = filter.value2

    // Handle empty/not empty operators
    if (filter.operator === 'is_empty') {
      return fieldValue === null || fieldValue === undefined || fieldValue === ''
    }
    if (filter.operator === 'is_not_empty') {
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== ''
    }

    // If field is empty/null and we're not checking for emptiness, return false
    if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
      return false
    }

    // String operations
    if (typeof fieldValue === 'string' && typeof filterValue === 'string') {
      const fieldLower = fieldValue.toLowerCase()
      const filterLower = filterValue.toLowerCase()

      switch (filter.operator) {
        case 'equals':
          return fieldLower === filterLower
        case 'not_equals':
          return fieldLower !== filterLower
        case 'contains':
          return fieldLower.includes(filterLower)
        case 'not_contains':
          return !fieldLower.includes(filterLower)
        case 'starts_with':
          return fieldLower.startsWith(filterLower)
        case 'ends_with':
          return fieldLower.endsWith(filterLower)
      }
    }

    // Array operations (for multi-select)
    if (filter.operator === 'in' && Array.isArray(filterValue)) {
      return filterValue.includes(fieldValue)
    }
    if (filter.operator === 'not_in' && Array.isArray(filterValue)) {
      return !filterValue.includes(fieldValue)
    }

    // Date operations
    if (fieldValue instanceof Date && filterValue instanceof Date) {
      const fieldTime = fieldValue.getTime()
      const filterTime = filterValue.getTime()

      switch (filter.operator) {
        case 'equals_date':
          // Compare dates without time
          const fieldDate = new Date(fieldValue.getFullYear(), fieldValue.getMonth(), fieldValue.getDate())
          const filterDate = new Date(filterValue.getFullYear(), filterValue.getMonth(), filterValue.getDate())
          return fieldDate.getTime() === filterDate.getTime()
        case 'before':
          return fieldTime < filterTime
        case 'after':
          return fieldTime > filterTime
        case 'between_dates':
          if (filterValue2 instanceof Date) {
            const filterTime2 = filterValue2.getTime()
            return fieldTime >= filterTime && fieldTime <= filterTime2
          }
          return false
      }
    }

    // Exact match fallback
    if (filter.operator === 'equals') {
      return fieldValue === filterValue
    }
    if (filter.operator === 'not_equals') {
      return fieldValue !== filterValue
    }

    return false
  }

  get leadsByStatus(): Record<LeadStatus, Lead[]> {
    return {
      Hot: this.leads.filter(lead => lead.status === 'Hot'),
      Warm: this.leads.filter(lead => lead.status === 'Warm'),
      Cold: this.leads.filter(lead => lead.status === 'Cold')
    }
  }

  get totalLeads(): number {
    return this.leads.length
  }
}