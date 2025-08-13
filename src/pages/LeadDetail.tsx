import { useState, useEffect } from "react";
import * as React from "react";
import { observer } from "mobx-react-lite";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../hooks/useStore";
import { CallLogForm } from "../components/CallLogForm";
import { CallLogThread } from "../components/CallLogThread";
import { StatusBadge } from "../components/StatusBadge";
import { LeadForm } from "../components/LeadForm";
import { CallLogFilterButton } from "../components/CallLogFilterButton";
import type { Lead, CallLog } from "../types";
import type { CallLogFilterCondition } from "../config/callLogFilterConfig";
import { applyCallLogFilters } from "../utils/callLogFilters";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const LeadHeader = styled.div`
  flex: 1;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const ContactSection = styled.div`
  background: white;
  padding: 24px 0;
  border-bottom: 1px solid #e5e7eb;
`;

const HistorySection = styled.div`
  background: white;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 400px);
  min-height: 400px;
`;

const ScrollableThreadContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const HistoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const SearchSortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  width: 200px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SortButton = styled.button<{ $hasActiveSort?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: ${(props) => (props.$hasActiveSort ? "#eff6ff" : "white")};
  border: 1px solid ${(props) => (props.$hasActiveSort ? "#3b82f6" : "#d1d5db")};
  border-radius: 6px;
  font-size: 14px;
  color: ${(props) => (props.$hasActiveSort ? "#3b82f6" : "#374151")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const DropdownContent = styled(DropdownMenu.Content)`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 4px;
  min-width: 200px;
  z-index: 50;
`;

const DropdownItem = styled(DropdownMenu.Item)<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 14px;
  color: ${(props) => (props.$isActive ? "#3b82f6" : "#374151")};
  background-color: ${(props) => (props.$isActive ? "#eff6ff" : "transparent")};
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.$isActive ? "#dbeafe" : "#f3f4f6")};
    outline: none;
  }

  &:focus {
    background-color: ${(props) => (props.$isActive ? "#dbeafe" : "#f3f4f6")};
    outline: none;
  }
`;

const DropdownSeparator = styled(DropdownMenu.Separator)`
  height: 1px;
  background-color: #e2e8f0;
  margin: 4px 0;
`;

const SortOptionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ClearSortItem = styled(DropdownItem)`
  color: #dc2626;

  &:hover {
    background-color: #fef2f2;
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 32px 24px;
`;

const DetailField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FieldValue = styled.span`
  font-size: 14px;
  color: #111827;
  font-weight: 500;
`;

const LogCallButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const DialogOverlay = styled(Dialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  z-index: 1000;
`;

const DialogContent = styled(Dialog.Content)`
  background-color: white;
  border-radius: 6px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 500px;
  max-height: 85vh;
  padding: 0;
  z-index: 1001;
`;

const DialogTitle = styled(Dialog.Title)`
  margin: 0;
  font-weight: 600;
  color: #111827;
  font-size: 18px;
  margin-bottom: 16px;
`;

const DialogDescription = styled(Dialog.Description)`
  margin: 0 0 20px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
`;

const DialogActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ConfirmDialogContent = styled(Dialog.Content)`
  background-color: white;
  border-radius: 6px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 400px;
  padding: 24px;
  z-index: 1001;
`;

const Button = styled.button<{ variant?: "danger" | "secondary" }>`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;

  ${(props) =>
    props.variant === "danger"
      ? `
    background-color: #dc2626;
    color: white;
    border-color: #dc2626;
    
    &:hover {
      background-color: #b91c1c;
      border-color: #b91c1c;
    }
  `
      : `
    background-color: white;
    color: #374151;
    border-color: #d1d5db;
    
    &:hover {
      background-color: #f3f4f6;
    }
  `}
`;

const formatDate = (date: Date | null) => {
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export const LeadDetail: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { leadStore, callLogStore } = useStore();
  const [lead, setLead] = useState<Lead | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [callLogModalOpen, setCallLogModalOpen] = useState(false);
  const [editingCallLog, setEditingCallLog] = useState<CallLog | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [callLogToDelete, setCallLogToDelete] = useState<string | null>(null);
  const [leadEditModalOpen, setLeadEditModalOpen] = useState(false);
  const [leadDeleteConfirmOpen, setLeadDeleteConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof CallLog>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [callLogFilters, setCallLogFilters] = useState<
    CallLogFilterCondition[]
  >([]);

  // Filter and sort call logs
  const filteredAndSortedCallLogs = React.useMemo(() => {
    let filtered = callLogs;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.notes.toLowerCase().includes(query) ||
          log.type.toLowerCase().includes(query) ||
          log.caller.toLowerCase().includes(query) ||
          (log.outcome && log.outcome.toLowerCase().includes(query)) ||
          (log.otherPeople && log.otherPeople.toLowerCase().includes(query)) ||
          (log.nextAction && log.nextAction.toLowerCase().includes(query))
      );
    }

    // Apply advanced filters
    filtered = applyCallLogFilters(filtered, callLogFilters);

    // Apply sorting
    const sorted = filtered.slice().sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle undefined/null values - always put them at the end
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (aValue instanceof Date && bValue instanceof Date) {
        const aTime = aValue.getTime();
        const bTime = bValue.getTime();
        return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const aLower = aValue.toLowerCase();
        const bLower = bValue.toLowerCase();
        if (aLower < bLower) return sortOrder === "asc" ? -1 : 1;
        if (aLower > bLower) return sortOrder === "asc" ? 1 : -1;
        return 0;
      }

      // For number fields (like duration)
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Convert to string for comparison as fallback
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
      if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [callLogs, searchQuery, sortField, sortOrder, callLogFilters]);

  useEffect(() => {
    if (id) {
      const foundLead = leadStore.getLeadById(id);
      if (foundLead) {
        setLead(foundLead);
        // Load call logs for this lead
        const logs = callLogStore.getCallLogsByLeadId(id);
        setCallLogs(logs);
      } else {
        // Lead not found, redirect back
        navigate("/leads");
      }
    }
  }, [id, leadStore, callLogStore, navigate]);

  const handleCallLogSave = (success: boolean) => {
    if (success) {
      toast.success(
        editingCallLog
          ? "Call log updated successfully"
          : "Call log created successfully"
      );
      setCallLogModalOpen(false);
      setEditingCallLog(null);
      // Refresh call logs
      if (id) {
        const logs = callLogStore.getCallLogsByLeadId(id);
        setCallLogs(logs);
      }
    }
  };

  const handleEditCallLog = (callLog: CallLog) => {
    setEditingCallLog(callLog);
    setCallLogModalOpen(true);
  };

  const handleDeleteCallLog = (callLogId: string) => {
    setCallLogToDelete(callLogId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (callLogToDelete) {
      const success = callLogStore.deleteCallLog(callLogToDelete);
      if (success) {
        toast.success("Call log deleted successfully");
        // Refresh call logs
        if (id) {
          const logs = callLogStore.getCallLogsByLeadId(id);
          setCallLogs(logs);
        }
      } else {
        toast.error("Failed to delete call log");
      }
    }
    setDeleteConfirmOpen(false);
    setCallLogToDelete(null);
  };

  // Sort options for call history
  const sortOptions = [
    { key: "date", label: "Date", type: "date" },
    { key: "type", label: "Type", type: "string" },
    { key: "outcome", label: "Outcome", type: "string" },
    { key: "caller", label: "Caller", type: "string" },
  ] as const;

  // Call log filter management
  const handleAddCallLogFilter = () => {
    const newFilter: CallLogFilterCondition = {
      id: Date.now().toString(),
      field: "type",
      operator: "equals",
      value: "",
      dataType: "select",
    };
    setCallLogFilters((prev) => [...prev, newFilter]);
  };

  const handleUpdateCallLogFilter = (
    id: string,
    updates: Partial<CallLogFilterCondition>
  ) => {
    setCallLogFilters((prev) =>
      prev.map((filter) =>
        filter.id === id ? { ...filter, ...updates } : filter
      )
    );
  };

  const handleRemoveCallLogFilter = (id: string) => {
    setCallLogFilters((prev) => prev.filter((filter) => filter.id !== id));
  };

  const handleClearAllCallLogFilters = () => {
    setCallLogFilters([]);
  };

  const handleSort = (field: keyof CallLog) => {
    // If clicking the same field, toggle order; otherwise use ascending
    if (sortField === field) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortField(field);
      setSortOrder(newOrder);
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
  };

  const handleClearSort = () => {
    setSortField("date");
    setSortOrder("desc"); // Reset to default
  };

  const hasActiveSort = sortField !== "date" || sortOrder !== "desc";

  const getSortIcon = () => {
    if (!hasActiveSort) return <ArrowUpDown size={16} />;
    return sortOrder === "asc" ? (
      <ArrowUp size={16} />
    ) : (
      <ArrowDown size={16} />
    );
  };

  const getCurrentSortLabel = () => {
    const currentOption = sortOptions.find((opt) => opt.key === sortField);
    return currentOption?.label || "Date";
  };

  if (!lead) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate("/leads")}>
          <ArrowLeft size={20} />
        </BackButton>
        <LeadHeader>
          <PageTitle>
            {lead.name} from {lead.company}
          </PageTitle>
        </LeadHeader>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            variant="secondary"
            onClick={() => setLeadEditModalOpen(true)}
          >
            <Edit size={16} style={{ marginRight: "8px" }} />
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => setLeadDeleteConfirmOpen(true)}
          >
            <Trash2 size={16} style={{ marginRight: "8px" }} />
            Delete
          </Button>
        </div>
      </Header>

      <Content>
        <ContactSection>
          <DetailGrid>
            <DetailField>
              <FieldLabel>Email</FieldLabel>
              <FieldValue>{lead.email || "Not provided"}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Phone</FieldLabel>
              <FieldValue>{lead.phone || "Not provided"}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Account Owner</FieldLabel>
              <FieldValue>{lead.accountOwner}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Created By</FieldLabel>
              <FieldValue>{lead.createdBy}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Created</FieldLabel>
              <FieldValue>{formatDate(lead.createdAt)}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Last Updated</FieldLabel>
              <FieldValue>{formatDate(lead.updatedAt)}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Last Contacted</FieldLabel>
              <FieldValue>{formatDate(lead.lastContactedAt)}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Status</FieldLabel>
              <StatusBadge status={lead.status} />
            </DetailField>

            <DetailField>
              <FieldLabel>Deal Stage</FieldLabel>
              <FieldValue>{lead.dealStage}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Opportunity Size</FieldLabel>
              <FieldValue>{lead.opportunitySize}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Products</FieldLabel>
              <FieldValue>
                {lead.products?.length > 0 ? lead.products.join(", ") : "None"}
              </FieldValue>
            </DetailField>
          </DetailGrid>
        </ContactSection>

        <HistorySection>
          <HistoryHeader>
            <SearchSortContainer>
              <SearchInput
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Advanced Filter Button */}
              <CallLogFilterButton
                filters={callLogFilters}
                onAddFilter={handleAddCallLogFilter}
                onUpdateFilter={handleUpdateCallLogFilter}
                onRemoveFilter={handleRemoveCallLogFilter}
                onClearAll={handleClearAllCallLogFilters}
                filteredCount={filteredAndSortedCallLogs.length}
                totalCount={callLogs.length}
              />

              {/* Sort Dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <SortButton $hasActiveSort={hasActiveSort}>
                    {getSortIcon()}
                    {hasActiveSort ? getCurrentSortLabel() : "Sort"}
                    <ChevronDown size={16} />
                  </SortButton>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownContent align="start" sideOffset={4}>
                    {/* Sort Direction Controls */}
                    {hasActiveSort && (
                      <>
                        <DropdownItem onSelect={toggleSortOrder}>
                          <SortOptionGroup>
                            {sortOrder === "asc" ? (
                              <ArrowDown size={16} />
                            ) : (
                              <ArrowUp size={16} />
                            )}
                            <span>
                              Switch to{" "}
                              {sortOrder === "asc" ? "Descending" : "Ascending"}
                            </span>
                          </SortOptionGroup>
                        </DropdownItem>
                        <DropdownSeparator />
                      </>
                    )}

                    {/* Column Selection */}
                    {sortOptions.map((option) => (
                      <DropdownItem
                        key={option.key}
                        $isActive={sortField === option.key}
                        onSelect={() => handleSort(option.key)}
                      >
                        <span>{option.label}</span>
                        {sortField === option.key && getSortIcon()}
                      </DropdownItem>
                    ))}

                    {hasActiveSort && (
                      <>
                        <DropdownSeparator />
                        <ClearSortItem onSelect={handleClearSort}>
                          <SortOptionGroup>
                            <X size={16} />
                            <span>Clear Sort</span>
                          </SortOptionGroup>
                        </ClearSortItem>
                      </>
                    )}
                  </DropdownContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </SearchSortContainer>
            <LogCallButton onClick={() => setCallLogModalOpen(true)}>
              <Plus size={16} />
              New log
            </LogCallButton>
          </HistoryHeader>
          <ScrollableThreadContainer>
            <CallLogThread
              callLogs={filteredAndSortedCallLogs}
              onEditLog={handleEditCallLog}
              onDeleteLog={handleDeleteCallLog}
            />
          </ScrollableThreadContainer>
        </HistorySection>
      </Content>

      {/* Call Log Modal */}
      <Dialog.Root open={callLogModalOpen} onOpenChange={setCallLogModalOpen}>
        <Dialog.Portal>
          <DialogOverlay />
          <DialogContent>
            <CallLogForm
              callLog={editingCallLog || undefined}
              leadId={lead.id}
              onSave={handleCallLogSave}
              onCancel={() => {
                setCallLogModalOpen(false);
                setEditingCallLog(null);
              }}
            />
          </DialogContent>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <Dialog.Portal>
          <DialogOverlay />
          <ConfirmDialogContent>
            <DialogTitle>Delete Call Log</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this call log? This action cannot
              be undone.
            </DialogDescription>
            <DialogActions>
              <Dialog.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </Dialog.Close>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogActions>
          </ConfirmDialogContent>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Lead Edit Modal */}
      <Dialog.Root open={leadEditModalOpen} onOpenChange={setLeadEditModalOpen}>
        <Dialog.Portal>
          <DialogOverlay />
          <DialogContent>
            <LeadForm
              lead={lead}
              onSave={(success) => {
                if (success) {
                  toast.success("Lead updated successfully");
                  setLeadEditModalOpen(false);
                  // Refresh lead data
                  if (id) {
                    const updatedLead = leadStore.getLeadById(id);
                    if (updatedLead) {
                      setLead(updatedLead);
                    }
                  }
                } else {
                  toast.error("Failed to update lead");
                }
              }}
              onCancel={() => setLeadEditModalOpen(false)}
            />
          </DialogContent>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Lead Delete Confirmation Modal */}
      <Dialog.Root
        open={leadDeleteConfirmOpen}
        onOpenChange={setLeadDeleteConfirmOpen}
      >
        <Dialog.Portal>
          <DialogOverlay />
          <ConfirmDialogContent>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {lead.name} from {lead.company}?
              This action cannot be undone and will also delete all associated
              call logs.
            </DialogDescription>
            <DialogActions>
              <Dialog.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </Dialog.Close>
              <Button
                variant="danger"
                onClick={() => {
                  const success = leadStore.deleteLead(lead.id);
                  if (success) {
                    toast.success("Lead deleted successfully");
                    navigate("/leads");
                  } else {
                    toast.error("Failed to delete lead");
                  }
                  setLeadDeleteConfirmOpen(false);
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </ConfirmDialogContent>
        </Dialog.Portal>
      </Dialog.Root>
    </Container>
  );
});
