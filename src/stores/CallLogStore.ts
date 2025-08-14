import { makeAutoObservable, runInAction } from "mobx";
import type { CallLog, CallLogType, CallOutcome } from "../types";
import { LocalStorageManager, STORAGE_KEYS } from "../utils/localStorage";
import type { LeadStore } from "./LeadStore";

export class CallLogStore {
  callLogs: CallLog[] = [];
  loading = false;
  typeFilter: CallLogType | "all" = "all";
  outcomeFilter: CallOutcome | "all" = "all";
  sortBy: "date" | "duration" = "date";
  sortOrder: "asc" | "desc" = "desc";
  private leadStore?: LeadStore;

  constructor(leadStore?: LeadStore) {
    makeAutoObservable(this);
    this.leadStore = leadStore;
    this.loadCallLogs();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private saveCallLogs(): void {
    LocalStorageManager.setItem(STORAGE_KEYS.CALL_LOGS, this.callLogs);
  }

  loadCallLogs(): void {
    this.loading = true;
    try {
      const savedCallLogs = LocalStorageManager.getItem<CallLog[]>(
        STORAGE_KEYS.CALL_LOGS,
        []
      );
      runInAction(() => {
        this.callLogs = savedCallLogs;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  addCallLog(callLogData: Omit<CallLog, "id">): {
    success: boolean;
    callLog?: CallLog;
    error?: string;
  } {
    try {
      const newCallLog: CallLog = {
        ...callLogData,
        id: this.generateId(),
      };

      this.callLogs.push(newCallLog);
      this.saveCallLogs();

      // Update lead status and last contacted date
      if (this.leadStore) {
        this.leadStore.updateLastContacted(
          newCallLog.leadId,
          new Date(newCallLog.date)
        );
        this.leadStore.updateLeadStatus(newCallLog.leadId, this.callLogs);
      }

      return { success: true, callLog: newCallLog };
    } catch (error) {
      console.log({ error });
      return { success: false, error: "Failed to add call log" };
    }
  }

  updateCallLog(id: string, updates: Partial<Omit<CallLog, "id">>): boolean {
    const callLogIndex = this.callLogs.findIndex((log) => log.id === id);
    if (callLogIndex === -1) return false;

    this.callLogs[callLogIndex] = {
      ...this.callLogs[callLogIndex],
      ...updates,
    };
    this.saveCallLogs();
    return true;
  }

  deleteCallLog(id: string): boolean {
    const initialLength = this.callLogs.length;
    this.callLogs = this.callLogs.filter((log) => log.id !== id);
    const wasDeleted = this.callLogs.length < initialLength;
    if (wasDeleted) {
      this.saveCallLogs();
    }
    return wasDeleted;
  }

  getCallLogById(id: string): CallLog | undefined {
    return this.callLogs.find((log) => log.id === id);
  }

  // getCallLogsByLeadId(leadId: string): CallLog[] {
  //   return this.callLogs
  //     .filter((log) => log.leadId === leadId)
  //     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  // }

  setTypeFilter(type: CallLogType | "all"): void {
    this.typeFilter = type;
  }

  setOutcomeFilter(outcome: CallOutcome | "all"): void {
    this.outcomeFilter = outcome;
  }

  setSorting(
    sortBy: typeof this.sortBy,
    sortOrder: typeof this.sortOrder
  ): void {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }

  get filteredAndSortedCallLogs(): CallLog[] {
    let filtered = this.callLogs;

    // Apply type filter
    if (this.typeFilter !== "all") {
      filtered = filtered.filter((log) => log.type === this.typeFilter);
    }

    // Apply outcome filter
    if (this.outcomeFilter !== "all") {
      filtered = filtered.filter((log) => log.outcome === this.outcomeFilter);
    }

    // Apply sorting
    filtered.slice().sort((a, b) => {
      let aValue: number | Date =
        this.sortBy === "date" ? a.date : a.duration || 0;
      let bValue: number | Date =
        this.sortBy === "date" ? b.date : b.duration || 0;

      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      if (aValue < bValue) return this.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return this.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }

  getCallLogsByLeadId(leadId: string): CallLog[] {
    return this.callLogs.filter((log) => log.leadId === leadId);
  }

  get totalCallLogs(): number {
    return this.callLogs.length;
  }

  get callsToday(): CallLog[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.callLogs.filter((log) => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
  }

  get callsThisWeek(): CallLog[] {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return this.callLogs.filter((log) => new Date(log.date) >= startOfWeek);
  }

  get averageCallsPerDay(): number {
    if (this.callLogs.length === 0) return 0;

    const today = new Date();
    const firstCall = this.callLogs.reduce((earliest, log) =>
      new Date(log.date) < new Date(earliest.date) ? log : earliest
    );

    const daysSinceFirst = Math.max(
      1,
      Math.ceil(
        (today.getTime() - new Date(firstCall.date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    return Math.round((this.callLogs.length / daysSinceFirst) * 100) / 100;
  }
}
