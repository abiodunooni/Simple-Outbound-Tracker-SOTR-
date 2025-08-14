import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as ContextMenu from "@radix-ui/react-context-menu";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon, Trash2Icon, EditIcon } from "lucide-react";
import { useStore } from "../hooks/useStore";
import type { Lead } from "../types";

interface LeadListProps {
  onLeadSelect?: (lead: Lead) => void;
  onLeadEdit?: (lead: Lead) => void;
  onLeadDelete?: (leadId: string) => void;
  selectedLeads: Set<string>;
  onSelectionChange: (selectedLeads: Set<string>) => void;
  visibleColumns?: {
    phone: boolean;
    accountOwner: boolean;
    createdAt: boolean;
    updatedAt: boolean;
    createdBy: boolean;
    lastContactedAt: boolean;
  };
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
`;

const TableHeader = styled.thead`
  background-color: var(--background-secondary);
`;

const TableRow = styled.tr`
  &:hover {
    background-color: var(--background-hover);
  }

  &:last-child {
    td:first-child {
      border-bottom-left-radius: 8px;
    }

    td:last-child {
      border-bottom-right-radius: 8px;
    }
  }
`;

const TableHeaderCell = styled.th<{ $sortable?: boolean }>`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: ${(props) => (props.$sortable ? "pointer" : "default")};

  &:first-child {
    border-top-left-radius: 8px;
  }

  &:last-child {
    border-top-right-radius: 8px;
  }

  &:hover {
    color: ${(props) => (props.$sortable ? "var(--text-primary)" : "var(--text-secondary)")};
  }
`;

const TableCell = styled.td`
  padding: 12px 16px;
  color: var(--text-secondary);
  font-size: 14px;
  border-bottom: 1px solid var(--border-color);

  tr:last-child & {
    border-bottom: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 16px;
  color: var(--text-muted);
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CustomCheckbox = styled(Checkbox.Root)`
  all: unset;
  background-color: var(--background-primary);
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  cursor: pointer;

  &:hover {
    border-color: var(--border-hover);
  }

  &[data-state="checked"] {
    background-color: var(--accent-primary);
    border-color: var(--accent-primary);
  }

  &:focus {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
  }
`;

const CheckboxIndicator = styled(Checkbox.Indicator)`
  color: white;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  & > svg {
    width: 12px;
    height: 12px;
  }
`;

const ContextMenuContent = styled(ContextMenu.Content)`
  min-width: 150px;
  background-color: var(--background-primary);
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2);
  border: 1px solid var(--border-color);
  z-index: 100;
`;

const ContextMenuItem = styled(ContextMenu.Item)`
  all: unset;
  font-size: 14px;
  line-height: 1;
  color: var(--text-secondary);
  border-radius: 3px;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 8px;
  position: relative;
  user-select: none;
  cursor: pointer;

  &:hover {
    background-color: var(--background-hover);
    color: var(--text-primary);
  }

  &[data-highlighted] {
    background-color: var(--background-hover);
    color: var(--text-primary);
  }

  &[data-disabled] {
    color: var(--text-muted);
    pointer-events: none;
  }

  & > svg {
    margin-right: 8px;
    width: 16px;
    height: 16px;
  }
`;

const DialogOverlay = styled(Dialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  z-index: 1000;
`;

const DialogContent = styled(Dialog.Content)`
  background-color: var(--background-primary);
  border-radius: 6px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
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
  color: var(--text-primary);
  font-size: 18px;
  margin-bottom: 16px;
`;

const DialogDescription = styled(Dialog.Description)`
  margin: 0 0 20px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
`;

const DialogActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid;

  ${props => {
    switch (props.variant) {
      case 'danger':
        return `
          background-color: var(--error);
          border-color: var(--error);
          color: white;
          &:hover {
            opacity: 0.9;
          }
        `;
      case 'primary':
        return `
          background-color: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
          &:hover {
            background-color: var(--accent-hover);
          }
        `;
      default:
        return `
          background-color: var(--background-primary);
          border-color: var(--border-color);
          color: var(--text-secondary);
          &:hover {
            background-color: var(--background-hover);
          }
        `;
    }
  }}
`;


const formatDate = (date: Date | null) => {
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const LeadList: React.FC<LeadListProps> = observer(
  ({ onLeadSelect, onLeadEdit, selectedLeads, onSelectionChange, visibleColumns }) => {
    const { leadStore } = useStore();
    const navigate = useNavigate();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

    const handleSort = (
      field: "name" | "company" | "createdAt" | "updatedAt" | "lastContactedAt"
    ) => {
      const newOrder =
        leadStore.sortBy === field && leadStore.sortOrder === "asc"
          ? "desc"
          : "asc";
      leadStore.setSorting(field, newOrder);
    };

    const getSortIndicator = (field: string) => {
      if (leadStore.sortBy !== field) return "";
      return leadStore.sortOrder === "asc" ? " ↑" : " ↓";
    };

    const handleSelectAll = (checked: boolean) => {
      if (checked) {
        onSelectionChange(new Set(leads.map(lead => lead.id)));
      } else {
        onSelectionChange(new Set());
      }
    };

    const handleSelectLead = (leadId: string, checked: boolean) => {
      const newSelection = new Set(selectedLeads);
      if (checked) {
        newSelection.add(leadId);
      } else {
        newSelection.delete(leadId);
      }
      onSelectionChange(newSelection);
    };

    const handleDeleteLead = (lead: Lead) => {
      setLeadToDelete(lead);
      setDeleteConfirmOpen(true);
    };

    const handleEditLead = (lead: Lead) => {
      onLeadEdit?.(lead);
    };

    const confirmDelete = () => {
      if (leadToDelete) {
        leadStore.deleteLead(leadToDelete.id);
        const newSelection = new Set(selectedLeads);
        newSelection.delete(leadToDelete.id);
        onSelectionChange(newSelection);
      }
      setLeadToDelete(null);
      setDeleteConfirmOpen(false);
    };

    if (leadStore.loading) {
      return <div>Loading leads...</div>;
    }

    const leads = leadStore.filteredAndSortedLeads;
    const allSelected = leads.length > 0 && selectedLeads.size === leads.length;
    const someSelected = selectedLeads.size > 0 && selectedLeads.size < leads.length;
    
    // Default to all columns visible if not specified
    const columns = visibleColumns || {
      phone: true,
      accountOwner: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      lastContactedAt: true
    };

    return (
      <Container>
        
        {leads.length === 0 ? (
          <EmptyState>
            No leads yet. Add your first lead to get started.
          </EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell style={{ width: '50px' }}>
                  <CheckboxWrapper>
                    <CustomCheckbox
                      checked={allSelected || someSelected}
                      onCheckedChange={handleSelectAll}
                    >
                      <CheckboxIndicator>
                        <CheckIcon />
                      </CheckboxIndicator>
                    </CustomCheckbox>
                  </CheckboxWrapper>
                </TableHeaderCell>
                <TableHeaderCell $sortable onClick={() => handleSort("name")}>
                  Name{getSortIndicator("name")}
                </TableHeaderCell>
                <TableHeaderCell
                  $sortable
                  onClick={() => handleSort("company")}
                >
                  Company{getSortIndicator("company")}
                </TableHeaderCell>
                {columns.phone && <TableHeaderCell>Phone</TableHeaderCell>}
                <TableHeaderCell>Email</TableHeaderCell>
                {columns.accountOwner && <TableHeaderCell>Account Owner</TableHeaderCell>}
                {columns.createdAt && (
                  <TableHeaderCell
                    $sortable
                    onClick={() => handleSort("createdAt")}
                  >
                    Created At{getSortIndicator("createdAt")}
                  </TableHeaderCell>
                )}
                {columns.updatedAt && (
                  <TableHeaderCell
                    $sortable
                    onClick={() => handleSort("updatedAt")}
                  >
                    Updated At{getSortIndicator("updatedAt")}
                  </TableHeaderCell>
                )}
                {columns.createdBy && <TableHeaderCell>Created By</TableHeaderCell>}
                {columns.lastContactedAt && (
                  <TableHeaderCell
                    $sortable
                    onClick={() => handleSort("lastContactedAt")}
                  >
                    Last Contacted{getSortIndicator("lastContactedAt")}
                  </TableHeaderCell>
                )}
              </TableRow>
            </TableHeader>
            <tbody>
              {leads.map((lead) => (
                <ContextMenu.Root key={lead.id}>
                  <ContextMenu.Trigger asChild>
                    <TableRow>
                      <TableCell>
                        <CheckboxWrapper>
                          <CustomCheckbox
                            checked={selectedLeads.has(lead.id)}
                            onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                          >
                            <CheckboxIndicator>
                              <CheckIcon />
                            </CheckboxIndicator>
                          </CustomCheckbox>
                        </CheckboxWrapper>
                      </TableCell>
                      <TableCell>
                        <span
                          style={{ cursor: "pointer", color: "var(--accent-primary)" }}
                          onClick={() => {
                            if (onLeadSelect) {
                              onLeadSelect(lead);
                            } else {
                              navigate(`/leads/${lead.id}`);
                            }
                          }}
                        >
                          {lead.name}
                        </span>
                      </TableCell>
                      <TableCell>{lead.company}</TableCell>
                      {columns.phone && <TableCell>{lead.phone}</TableCell>}
                      <TableCell>{lead.email}</TableCell>
                      {columns.accountOwner && <TableCell>{lead.accountOwner}</TableCell>}
                      {columns.createdAt && <TableCell>{formatDate(lead.createdAt)}</TableCell>}
                      {columns.updatedAt && <TableCell>{formatDate(lead.updatedAt)}</TableCell>}
                      {columns.createdBy && <TableCell>{lead.createdBy}</TableCell>}
                      {columns.lastContactedAt && <TableCell>{formatDate(lead.lastContactedAt)}</TableCell>}
                    </TableRow>
                  </ContextMenu.Trigger>
                  <ContextMenu.Portal>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => handleEditLead(lead)}>
                        <EditIcon />
                        Edit Lead
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleDeleteLead(lead)}>
                        <Trash2Icon />
                        Delete Lead
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu.Portal>
                </ContextMenu.Root>
              ))}
            </tbody>
          </Table>
        )}

        {/* Delete Confirmation Modal */}
        <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <Dialog.Portal>
            <DialogOverlay />
            <DialogContent>
              <DialogTitle>Delete Lead</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {leadToDelete?.name}? This action cannot be undone.
              </DialogDescription>
              <DialogActions>
                <Dialog.Close asChild>
                  <Button variant="secondary">Cancel</Button>
                </Dialog.Close>
                <Button variant="danger" onClick={confirmDelete}>
                  Delete
                </Button>
              </DialogActions>
            </DialogContent>
          </Dialog.Portal>
        </Dialog.Root>

      </Container>
    );
  }
);