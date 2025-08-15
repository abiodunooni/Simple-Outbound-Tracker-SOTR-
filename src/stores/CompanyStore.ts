import { makeAutoObservable, runInAction } from 'mobx'
import type { Company, Industry, CompanySize, CompanyFilterCondition } from '../types'
import { LocalStorageManager, STORAGE_KEYS } from '../utils/localStorage'

export class CompanyStore {
  companies: Company[] = []
  loading = false
  searchQuery = ''
  industryFilter: Industry | 'all' = 'all'
  sizeFilter: CompanySize | 'all' = 'all'
  sortBy: 'name' | 'industry' | 'size' | 'createdAt' | 'updatedAt' | 'lastContactedAt' = 'createdAt'
  sortOrder: 'asc' | 'desc' = 'desc'
  filters: CompanyFilterCondition[] = []

  constructor() {
    makeAutoObservable(this)
    this.loadCompanies()
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  private saveCompanies(): void {
    LocalStorageManager.setItem(STORAGE_KEYS.COMPANIES, this.companies)
  }

  loadCompanies(): void {
    this.loading = true
    try {
      const savedCompanies = LocalStorageManager.getItem<Company[]>(STORAGE_KEYS.COMPANIES, [])
      runInAction(() => {
        this.companies = savedCompanies
        this.loading = false
      })
    } catch {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  checkNameExists(name: string, excludeId?: string): boolean {
    return this.companies.some(company => 
      company.name.toLowerCase() === name.toLowerCase() && 
      company.id !== excludeId
    )
  }

  addCompany(companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastContactedAt' | 'accountOwner'>): { success: boolean; company?: Company; error?: string } {
    if (this.checkNameExists(companyData.name)) {
      return {
        success: false,
        error: 'A company with this name already exists'
      }
    }

    const newCompany: Company = {
      ...companyData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Sammy',
      accountOwner: 'Sammy',
      lastContactedAt: null
    }

    this.companies.push(newCompany)
    this.saveCompanies()
    return { success: true, company: newCompany }
  }

  updateCompany(id: string, updates: Partial<Omit<Company, 'id' | 'createdAt' | 'createdBy'>>): boolean {
    const companyIndex = this.companies.findIndex(company => company.id === id)
    if (companyIndex === -1) return false

    this.companies[companyIndex] = { 
      ...this.companies[companyIndex], 
      ...updates,
      updatedAt: new Date()
    }
    this.saveCompanies()
    return true
  }

  deleteCompany(id: string): boolean {
    const initialLength = this.companies.length
    this.companies = this.companies.filter(company => company.id !== id)
    const wasDeleted = this.companies.length < initialLength
    if (wasDeleted) {
      this.saveCompanies()
    }
    return wasDeleted
  }

  deleteCompanies(ids: string[]): number {
    const initialLength = this.companies.length
    this.companies = this.companies.filter(company => !ids.includes(company.id))
    const deletedCount = initialLength - this.companies.length
    if (deletedCount > 0) {
      this.saveCompanies()
    }
    return deletedCount
  }

  getCompanyById(id: string): Company | undefined {
    return this.companies.find(company => company.id === id)
  }

  updateLastContacted(id: string, date: Date = new Date()): void {
    this.updateCompany(id, { lastContactedAt: date })
  }

  setSearchQuery(query: string): void {
    this.searchQuery = query
  }

  setIndustryFilter(industry: Industry | 'all'): void {
    this.industryFilter = industry
  }

  setSizeFilter(size: CompanySize | 'all'): void {
    this.sizeFilter = size
  }

  setSorting(sortBy: typeof this.sortBy, sortOrder: typeof this.sortOrder): void {
    this.sortBy = sortBy
    this.sortOrder = sortOrder
  }

  addFilter(condition: CompanyFilterCondition): void {
    this.filters.push(condition)
  }

  updateFilter(id: string, updates: Partial<CompanyFilterCondition>): void {
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

  get filteredAndSortedCompanies(): Company[] {
    let filtered = this.companies

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase()
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(query) ||
        (company.website && company.website.toLowerCase().includes(query)) ||
        (company.location && company.location.toLowerCase().includes(query)) ||
        (company.description && company.description.toLowerCase().includes(query))
      )
    }

    if (this.industryFilter !== 'all') {
      filtered = filtered.filter(company => company.industry === this.industryFilter)
    }

    if (this.sizeFilter !== 'all') {
      filtered = filtered.filter(company => company.size === this.sizeFilter)
    }

    // Apply advanced filters
    filtered = this.applyFilters(filtered)

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

      if (aValue === null && bValue === null) return 0
      if (aValue === null) return this.sortOrder === 'asc' ? -1 : 1
      if (bValue === null) return this.sortOrder === 'asc' ? 1 : -1
      
      return 0
    })

    return sorted
  }

  private applyFilters(companies: Company[]): Company[] {
    if (this.filters.length === 0) {
      return companies
    }

    return companies.filter(company => 
      this.filters.every(filter => this.matchesFilter(company, filter))
    )
  }

  private matchesFilter(company: Company, filter: CompanyFilterCondition): boolean {
    const fieldValue = company[filter.field]
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
        case 'equals_date': {
          // Compare dates without time
          const fieldDate = new Date(fieldValue.getFullYear(), fieldValue.getMonth(), fieldValue.getDate())
          const filterDate = new Date(filterValue.getFullYear(), filterValue.getMonth(), filterValue.getDate())
          return fieldDate.getTime() === filterDate.getTime()
        }
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

  get companiesByIndustry(): Record<Industry, Company[]> {
    const industries: Industry[] = ['fintech', 'e-commerce', 'healthcare', 'education', 'gaming', 'logistics', 'real-estate', 'government', 'non-profit', 'other']
    
    return industries.reduce((acc, industry) => {
      acc[industry] = this.companies.filter(company => company.industry === industry)
      return acc
    }, {} as Record<Industry, Company[]>)
  }

  get companiesBySize(): Record<CompanySize, Company[]> {
    const sizes: CompanySize[] = ['startup', 'small', 'medium', 'large', 'enterprise']
    
    return sizes.reduce((acc, size) => {
      acc[size] = this.companies.filter(company => company.size === size)
      return acc
    }, {} as Record<CompanySize, Company[]>)
  }

  get totalCompanies(): number {
    return this.companies.length
  }
}