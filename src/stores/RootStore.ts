import { LeadStore } from './LeadStore'
import { CallLogStore } from './CallLogStore'
import { CompanyStore } from './CompanyStore'

class RootStore {
  leadStore: LeadStore
  callLogStore: CallLogStore
  companyStore: CompanyStore

  constructor() {
    this.leadStore = new LeadStore()
    this.callLogStore = new CallLogStore(this.leadStore)
    this.companyStore = new CompanyStore()
  }
}

export default RootStore