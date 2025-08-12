export class LocalStorageManager {
  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value, (_key, val) => {
        if (val instanceof Date) {
          return val.toISOString()
        }
        return val
      })
      localStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error(`Error saving to localStorage:`, error)
    }
  }

  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue
      }
      
      const parsed = JSON.parse(item, (_key, value) => {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value)
        }
        return value
      })
      
      return parsed
    } catch (error) {
      console.error(`Error reading from localStorage:`, error)
      return defaultValue
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage:`, error)
    }
  }

  static clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error(`Error clearing localStorage:`, error)
    }
  }
}

export const STORAGE_KEYS = {
  LEADS: 'sales_tracker_leads',
  CALL_LOGS: 'sales_tracker_call_logs'
} as const