import { useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Trash2,
  Columns3,
} from "lucide-react";
import { useStore } from "../hooks/useStore";
import { LeadList } from "../components/LeadList";
import { LeadForm } from "../components/LeadForm";
import { FilterButton } from "../components/FilterButton";
import type { Lead } from "../types";

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
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 16px;
  color: #6b7280;
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: #e5e7eb;
  margin: 0;
`;

const TableSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const SearchAndSortGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  width: 300px;

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

const Button = styled.button<{ variant?: "primary" | "danger" }>`
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  display: flex;
  align-items: center;
  gap: 8px;

  ${(props) => {
    if (props.variant === "danger") {
      return `
        background-color: #dc2626;
        color: white;
        border-color: #dc2626;
        
        &:hover {
          background-color: #b91c1c;
          border-color: #b91c1c;
        }
      `;
    }
    return `
      background-color: #3b82f6;
      color: white;
      border-color: #3b82f6;
      
      &:hover {
        background-color: #2563eb;
        border-color: #2563eb;
      }
    `;
  }}
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
  max-width: 450px;
  max-height: 85vh;
  padding: 24px;
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

export const Leads: React.FC = observer(() => {
  const { leadStore } = useStore();
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  // Column visibility state - columns that can be toggled
  const [visibleColumns, setVisibleColumns] = useState({
    phone: true,
    accountOwner: true,
    createdAt: false,
    updatedAt: false,
    createdBy: false,
    lastContactedAt: true,
  });

  const handleAddLead = () => {
    setEditingLead(null);
    setLeadFormOpen(true);
  };

  const handleLeadFormSave = (success: boolean) => {
    if (success) {
      setLeadFormOpen(false);
      setEditingLead(null);
    }
  };

  const handleLeadEdit = (lead: Lead) => {
    setEditingLead(lead);
    setLeadFormOpen(true);
  };

  const handleLeadFormClose = () => {
    setLeadFormOpen(false);
    setEditingLead(null);
  };

  const handleBulkDelete = () => {
    setBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = () => {
    leadStore.deleteLeads(Array.from(selectedLeads));
    setSelectedLeads(new Set());
    setBulkDeleteConfirmOpen(false);
  };

  // Column configuration for the visibility toggle
  const toggleableColumns = [
    { key: "phone", label: "Phone" },
    { key: "accountOwner", label: "Account Owner" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "createdBy", label: "Created By" },
    { key: "lastContactedAt", label: "Last Contacted" },
  ] as const;

  const toggleColumnVisibility = (columnKey: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const sortOptions = [
    { key: "name", label: "Name", type: "string" },
    { key: "company", label: "Company", type: "string" },
    { key: "phone", label: "Phone", type: "string" },
    { key: "email", label: "Email", type: "string" },
    { key: "createdAt", label: "Created At", type: "date" },
    { key: "updatedAt", label: "Updated At", type: "date" },
    { key: "lastContactedAt", label: "Last Contacted", type: "date" },
  ] as const;

  const handleSort = (field: typeof leadStore.sortBy) => {
    // If clicking the same field, toggle order; otherwise use ascending
    if (leadStore.sortBy === field) {
      const newOrder = leadStore.sortOrder === "asc" ? "desc" : "asc";
      leadStore.setSorting(field, newOrder);
    } else {
      leadStore.setSorting(field, "asc");
    }
  };

  const toggleSortOrder = () => {
    const newOrder = leadStore.sortOrder === "asc" ? "desc" : "asc";
    leadStore.setSorting(leadStore.sortBy, newOrder);
  };

  const handleClearSort = () => {
    leadStore.setSorting("createdAt", "desc"); // Reset to default
  };

  const hasActiveSort =
    leadStore.sortBy !== "createdAt" || leadStore.sortOrder !== "desc";

  const getSortIcon = () => {
    if (!hasActiveSort) return <ArrowUpDown size={16} />;
    return leadStore.sortOrder === "asc" ? (
      <ArrowUp size={16} />
    ) : (
      <ArrowDown size={16} />
    );
  };

  const getCurrentSortLabel = () => {
    const currentOption = sortOptions.find(
      (opt) => opt.key === leadStore.sortBy
    );
    return currentOption?.label || "Created At";
  };

  return (
    <>
      <Container>
        <Header>
          <Title>Leads</Title>
          <Subtitle>Manage and track your sales prospects</Subtitle>
        </Header>
        <Divider />
        <TableSection>
          <TableHeader>
            <SearchAndSortGroup>
              <SearchInput
                type="text"
                placeholder="Search leads by name, company, email, or phone..."
                value={leadStore.searchQuery}
                onChange={(e) => leadStore.setSearchQuery(e.target.value)}
              />

              <FilterButton />

              {/* Column Visibility Dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <SortButton>
                    <Columns3 size={16} />
                    Columns
                    <ChevronDown size={16} />
                  </SortButton>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownContent align="start" sideOffset={4}>
                    <DropdownItem
                      disabled
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#6b7280",
                      }}
                    >
                      Toggle Column Visibility
                    </DropdownItem>
                    <DropdownSeparator />

                    {toggleableColumns.map((column) => (
                      <DropdownItem
                        key={column.key}
                        onSelect={(e) => {
                          e.preventDefault();
                          toggleColumnVisibility(column.key);
                        }}
                        style={{ justifyContent: "space-between" }}
                      >
                        <span>{column.label}</span>
                        <span
                          style={{
                            color: visibleColumns[column.key]
                              ? "#10b981"
                              : "#6b7280",
                          }}
                        >
                          {visibleColumns[column.key] ? "✓" : "○"}
                        </span>
                      </DropdownItem>
                    ))}
                  </DropdownContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

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
                            {leadStore.sortOrder === "asc" ? (
                              <ArrowDown size={16} />
                            ) : (
                              <ArrowUp size={16} />
                            )}
                            <span>
                              Switch to{" "}
                              {leadStore.sortOrder === "asc"
                                ? "Descending"
                                : "Ascending"}
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
                        $isActive={leadStore.sortBy === option.key}
                        onSelect={() =>
                          handleSort(option.key as typeof leadStore.sortBy)
                        }
                      >
                        <span>{option.label}</span>
                        {leadStore.sortBy === option.key && getSortIcon()}
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
            </SearchAndSortGroup>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {selectedLeads.size > 0 && (
                <Button variant="danger" onClick={handleBulkDelete}>
                  <Trash2 size={16} />
                  Delete Selected ({selectedLeads.size})
                </Button>
              )}
              <Button onClick={handleAddLead}>Add New Lead</Button>
            </div>
          </TableHeader>
          <LeadList
            onLeadEdit={handleLeadEdit}
            selectedLeads={selectedLeads}
            onSelectionChange={setSelectedLeads}
            visibleColumns={visibleColumns}
          />
        </TableSection>
      </Container>

      {/* Lead Form Modal */}
      <Dialog.Root
        open={leadFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleLeadFormClose();
          }
        }}
      >
        <Dialog.Portal>
          <DialogOverlay />
          <DialogContent style={{ maxWidth: "600px", padding: "0" }}>
            <LeadForm
              lead={editingLead || undefined}
              onSave={handleLeadFormSave}
              onCancel={handleLeadFormClose}
            />
          </DialogContent>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog.Root
        open={bulkDeleteConfirmOpen}
        onOpenChange={setBulkDeleteConfirmOpen}
      >
        <Dialog.Portal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>
              {selectedLeads.size === 1
                ? "Delete Lead"
                : "Delete Multiple Leads"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedLeads.size} lead
              {selectedLeads.size === 1 ? "" : "s"}? This action cannot be
              undone.
            </DialogDescription>
            <DialogActions>
              <Dialog.Close asChild>
                <Button>Cancel</Button>
              </Dialog.Close>
              <Button variant="danger" onClick={confirmBulkDelete}>
                Delete {selectedLeads.size} Lead
                {selectedLeads.size === 1 ? "" : "s"}
              </Button>
            </DialogActions>
          </DialogContent>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
});
