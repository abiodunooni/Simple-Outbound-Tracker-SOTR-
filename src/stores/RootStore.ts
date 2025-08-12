import { LeadStore } from './LeadStore'
import { CallLogStore } from './CallLogStore'

class RootStore {
  leadStore: LeadStore
  callLogStore: CallLogStore

  constructor() {
    this.leadStore = new LeadStore()
    this.callLogStore = new CallLogStore()
  }
}

export default RootStore