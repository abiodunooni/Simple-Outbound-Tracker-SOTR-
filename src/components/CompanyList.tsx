import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as ContextMenu from "@radix-ui/react-context-menu";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon, Trash2Icon, EditIcon, ExternalLinkIcon } from "lucide-react";
import { useStore } from "../hooks/useStore";
import type { Company } from "../types";

interface CompanyListProps {
  onCompanySelect?: (company: Company) => void;
  onCompanyEdit?: (company: Company) => void;
  onCompanyDelete?: (companyId: string) => void;
  selectedCompanies: Set<string>;
  onSelectionChange: (selectedCompanies: Set<string>) => void;
  visibleColumns?: {
    website: boolean;
    location: boolean;
    size: boolean;
    accountOwner: boolean;
    createdAt: boolean;
    updatedAt: boolean;
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

const CompanyName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  
  &:hover {
    color: var(--accent-primary);
  }
`;

const IndustryBadge = styled.span<{ $industry: string }>`
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
  background-color: ${(props) => {
    const colors = {
      fintech: '#3B82F6',
      'e-commerce': '#10B981',
      healthcare: '#EF4444',
      education: '#8B5CF6',
      gaming: '#F59E0B',
      logistics: '#6B7280',
      'real-estate': '#EC4899',
      government: '#14B8A6',
      'non-profit': '#84CC16',
      other: '#64748B'
    };
    return colors[props.$industry as keyof typeof colors] || colors.other;
  }};
  color: white;
`;

const SizeBadge = styled.span<{ $size: string }>`
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
  background-color: ${(props) => {
    const colors = {
      startup: '#F59E0B',
      small: '#10B981',
      medium: '#3B82F6',
      large: '#8B5CF6',
      enterprise: '#EF4444'
    };
    return colors[props.$size as keyof typeof colors] || '#64748B';
  }};
  color: white;
`;

const WebsiteLink = styled.a`
  color: var(--accent-primary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ResultCount = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledCheckbox = styled(Checkbox.Root)`
  background-color: var(--background-primary);
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border-color);
  cursor: pointer;

  &:hover {
    border-color: var(--accent-primary);
  }

  &[data-state="checked"] {
    background-color: var(--accent-primary);
    border-color: var(--accent-primary);
  }
`;

const StyledCheckboxIndicator = styled(Checkbox.Indicator)`
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContextMenuContent = styled(ContextMenu.Content)`
  min-width: 180px;
  background-color: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 6px;
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
`;

const ContextMenuItem = styled(ContextMenu.Item)`
  font-size: 14px;
  line-height: 1;
  color: var(--text-primary);
  border-radius: 3px;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  position: relative;
  user-select: none;
  cursor: pointer;

  &:hover {
    background-color: var(--background-hover);
    outline: none;
  }

  &:focus {
    background-color: var(--background-hover);
    outline: none;
  }
`;

const ContextMenuSeparator = styled(ContextMenu.Separator)`
  height: 1px;
  background-color: var(--border-color);
  margin: 5px;
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

const Button = styled.button<{ variant?: "primary" | "danger" }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;

  ${(props) => {
    if (props.variant === "danger") {
      return `
        background-color: var(--error);
        color: white;
        border-color: var(--error);
        
        &:hover {
          opacity: 0.9;
        }
      `;
    }
    return `
      background-color: var(--accent-primary);
      color: white;
      border-color: var(--accent-primary);
      
      &:hover {
        background-color: var(--accent-hover);
        border-color: var(--accent-hover);
      }
    `;
  }}
`;

export const CompanyList: React.FC<CompanyListProps> = observer(
  ({
    onCompanyEdit,
    selectedCompanies,
    onSelectionChange,
    visibleColumns = {
      website: true,
      location: true,
      size: true,
      accountOwner: false,
      createdAt: false,
      updatedAt: false,
      lastContactedAt: true,
    },
  }) => {
    const { companyStore } = useStore();
    const navigate = useNavigate();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

    const companies = companyStore.filteredAndSortedCompanies;

    const handleSelectAll = (checked: boolean) => {
      if (checked) {
        onSelectionChange(new Set(companies.map((company) => company.id)));
      } else {
        onSelectionChange(new Set());
      }
    };

    const handleSelectCompany = (companyId: string, checked: boolean) => {
      const newSelection = new Set(selectedCompanies);
      if (checked) {
        newSelection.add(companyId);
      } else {
        newSelection.delete(companyId);
      }
      onSelectionChange(newSelection);
    };

    const handleDelete = (company: Company) => {
      setCompanyToDelete(company);
      setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
      if (companyToDelete) {
        companyStore.deleteCompany(companyToDelete.id);
        onSelectionChange(new Set([...selectedCompanies].filter(id => id !== companyToDelete.id)));
        setDeleteConfirmOpen(false);
        setCompanyToDelete(null);
      }
    };

    const formatDate = (date: Date | null) => {
      if (!date) return "Never";
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    };

    const isAllSelected = companies.length > 0 && selectedCompanies.size === companies.length;
    const isIndeterminate = selectedCompanies.size > 0 && selectedCompanies.size < companies.length;

    if (companies.length === 0) {
      return (
        <Container>
          <EmptyState>
            {companyStore.searchQuery || companyStore.industryFilter !== 'all' || companyStore.sizeFilter !== 'all'
              ? "No companies match your filters"
              : "No companies yet. Add your first company to get started!"}
          </EmptyState>
        </Container>
      );
    }

    return (
      <>
        <Container>
          <ResultCount>
            {companies.length} compan{companies.length === 1 ? "y" : "ies"}
          </ResultCount>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>
                  <CheckboxContainer>
                    <StyledCheckbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      {...(isIndeterminate && { "data-state": "indeterminate" })}
                    >
                      <StyledCheckboxIndicator>
                        <CheckIcon size={14} />
                      </StyledCheckboxIndicator>
                    </StyledCheckbox>
                  </CheckboxContainer>
                </TableHeaderCell>
                <TableHeaderCell>Company</TableHeaderCell>
                <TableHeaderCell>Industry</TableHeaderCell>
                {visibleColumns.website && <TableHeaderCell>Website</TableHeaderCell>}
                {visibleColumns.location && <TableHeaderCell>Location</TableHeaderCell>}
                {visibleColumns.size && <TableHeaderCell>Size</TableHeaderCell>}
                {visibleColumns.accountOwner && <TableHeaderCell>Account Owner</TableHeaderCell>}
                {visibleColumns.createdAt && <TableHeaderCell>Created</TableHeaderCell>}
                {visibleColumns.updatedAt && <TableHeaderCell>Updated</TableHeaderCell>}
                {visibleColumns.lastContactedAt && <TableHeaderCell>Last Contact</TableHeaderCell>}
              </TableRow>
            </TableHeader>
            <tbody>
              {companies.map((company) => (
                <ContextMenu.Root key={company.id}>
                  <ContextMenu.Trigger asChild>
                    <TableRow>
                      <TableCell>
                        <CheckboxContainer>
                          <StyledCheckbox
                            checked={selectedCompanies.has(company.id)}
                            onCheckedChange={(checked) =>
                              handleSelectCompany(company.id, checked === true)
                            }
                          >
                            <StyledCheckboxIndicator>
                              <CheckIcon size={14} />
                            </StyledCheckboxIndicator>
                          </StyledCheckbox>
                        </CheckboxContainer>
                      </TableCell>
                      <TableCell>
                        <CompanyName onClick={() => navigate(`/companies/${company.id}`)}>
                          {company.name}
                        </CompanyName>
                      </TableCell>
                      <TableCell>
                        <IndustryBadge $industry={company.industry}>
                          {company.industry.charAt(0).toUpperCase() + company.industry.slice(1).replace('-', ' ')}
                        </IndustryBadge>
                      </TableCell>
                      {visibleColumns.website && (
                        <TableCell>
                          {company.website ? (
                            <WebsiteLink href={company.website} target="_blank" rel="noopener noreferrer">
                              {company.website.replace(/^https?:\/\//, '')}
                              <ExternalLinkIcon size={12} />
                            </WebsiteLink>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.location && <TableCell>{company.location || "-"}</TableCell>}
                      {visibleColumns.size && (
                        <TableCell>
                          <SizeBadge $size={company.size}>
                            {company.size.charAt(0).toUpperCase() + company.size.slice(1)}
                          </SizeBadge>
                        </TableCell>
                      )}
                      {visibleColumns.accountOwner && <TableCell>{company.accountOwner}</TableCell>}
                      {visibleColumns.createdAt && <TableCell>{formatDate(company.createdAt)}</TableCell>}
                      {visibleColumns.updatedAt && <TableCell>{formatDate(company.updatedAt)}</TableCell>}
                      {visibleColumns.lastContactedAt && <TableCell>{formatDate(company.lastContactedAt)}</TableCell>}
                    </TableRow>
                  </ContextMenu.Trigger>
                  <ContextMenu.Portal>
                    <ContextMenuContent>
                      <ContextMenuItem onSelect={() => onCompanyEdit?.(company)}>
                        <EditIcon size={14} style={{ marginRight: "8px" }} />
                        Edit Company
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onSelect={() => handleDelete(company)}>
                        <Trash2Icon size={14} style={{ marginRight: "8px" }} />
                        Delete Company
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu.Portal>
                </ContextMenu.Root>
              ))}
            </tbody>
          </Table>
        </Container>

        <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <Dialog.Portal>
            <DialogOverlay />
            <DialogContent>
              <DialogTitle>Delete Company</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{companyToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
              <DialogActions>
                <Dialog.Close asChild>
                  <Button>Cancel</Button>
                </Dialog.Close>
                <Button variant="danger" onClick={confirmDelete}>
                  Delete Company
                </Button>
              </DialogActions>
            </DialogContent>
          </Dialog.Portal>
        </Dialog.Root>
      </>
    );
  }
);