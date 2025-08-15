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
import { CompanyList } from "../components/CompanyList";
import { CompanyForm } from "../components/CompanyForm";
import { CompanyFilterButton } from "../components/CompanyFilterButton";
import type { Company } from "../types";

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
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 16px;
  color: var(--text-secondary);
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: var(--border-color);
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
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  width: 300px;
  background-color: var(--background-primary);
  color: var(--text-primary);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const SortButton = styled.button<{ $hasActiveSort?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: ${(props) => (props.$hasActiveSort ? "var(--accent-primary)" : "var(--background-primary)")};
  border: 1px solid ${(props) => (props.$hasActiveSort ? "var(--accent-primary)" : "var(--border-color)")};
  border-radius: 6px;
  font-size: 14px;
  color: ${(props) => (props.$hasActiveSort ? "white" : "var(--text-primary)")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.$hasActiveSort ? "var(--accent-hover)" : "var(--background-hover)")};
    border-color: var(--border-hover);
  }

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const DropdownContent = styled(DropdownMenu.Content)`
  background: var(--background-primary);
  border: 1px solid var(--border-color);
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
  color: ${(props) => (props.$isActive ? "var(--accent-primary)" : "var(--text-primary)")};
  background-color: ${(props) => (props.$isActive ? "var(--background-secondary)" : "transparent")};
  border-radius: 4px;
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

const DropdownSeparator = styled(DropdownMenu.Separator)`
  height: 1px;
  background-color: var(--border-color);
  margin: 4px 0;
`;

const SortOptionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ClearItem = styled(DropdownItem)`
  color: var(--error);

  &:hover {
    background-color: var(--background-hover);
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

export const Companies: React.FC = observer(() => {
  const { companyStore } = useStore();
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    website: true,
    location: true,
    size: true,
    accountOwner: false,
    createdAt: false,
    updatedAt: false,
    lastContactedAt: true,
  });

  const handleAddCompany = () => {
    setEditingCompany(null);
    setCompanyFormOpen(true);
  };

  const handleCompanyFormSave = (success: boolean) => {
    if (success) {
      setCompanyFormOpen(false);
      setEditingCompany(null);
    }
  };

  const handleCompanyEdit = (company: Company) => {
    setEditingCompany(company);
    setCompanyFormOpen(true);
  };

  const handleCompanyFormClose = () => {
    setCompanyFormOpen(false);
    setEditingCompany(null);
  };

  const handleBulkDelete = () => {
    setBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = () => {
    companyStore.deleteCompanies(Array.from(selectedCompanies));
    setSelectedCompanies(new Set());
    setBulkDeleteConfirmOpen(false);
  };

  const toggleableColumns = [
    { key: "website", label: "Website" },
    { key: "location", label: "Location" },
    { key: "size", label: "Size" },
    { key: "accountOwner", label: "Account Owner" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
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
    { key: "industry", label: "Industry", type: "string" },
    { key: "size", label: "Size", type: "string" },
    { key: "createdAt", label: "Created At", type: "date" },
    { key: "updatedAt", label: "Updated At", type: "date" },
    { key: "lastContactedAt", label: "Last Contacted", type: "date" },
  ] as const;

  const handleSort = (field: typeof companyStore.sortBy) => {
    if (companyStore.sortBy === field) {
      const newOrder = companyStore.sortOrder === "asc" ? "desc" : "asc";
      companyStore.setSorting(field, newOrder);
    } else {
      companyStore.setSorting(field, "asc");
    }
  };

  const toggleSortOrder = () => {
    const newOrder = companyStore.sortOrder === "asc" ? "desc" : "asc";
    companyStore.setSorting(companyStore.sortBy, newOrder);
  };

  const handleClearSort = () => {
    companyStore.setSorting("createdAt", "desc");
  };

  const hasActiveSort =
    companyStore.sortBy !== "createdAt" || companyStore.sortOrder !== "desc";

  const getSortIcon = () => {
    if (!hasActiveSort) return <ArrowUpDown size={16} />;
    return companyStore.sortOrder === "asc" ? (
      <ArrowUp size={16} />
    ) : (
      <ArrowDown size={16} />
    );
  };

  const getCurrentSortLabel = () => {
    const currentOption = sortOptions.find(
      (opt) => opt.key === companyStore.sortBy
    );
    return currentOption?.label || "Created At";
  };

  return (
    <>
      <Container>
        <Header>
          <Title>Companies</Title>
          <Subtitle>Manage and track your client companies</Subtitle>
        </Header>
        <Divider />
        <TableSection>
          <TableHeader>
            <SearchAndSortGroup>
              <SearchInput
                type="text"
                placeholder="Search companies by name, website, location..."
                value={companyStore.searchQuery}
                onChange={(e) => companyStore.setSearchQuery(e.target.value)}
              />

              <CompanyFilterButton />

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
                        color: "var(--text-muted)",
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
                              ? "var(--success)"
                              : "var(--text-muted)",
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
                    {hasActiveSort && (
                      <>
                        <DropdownItem onSelect={toggleSortOrder}>
                          <SortOptionGroup>
                            {companyStore.sortOrder === "asc" ? (
                              <ArrowDown size={16} />
                            ) : (
                              <ArrowUp size={16} />
                            )}
                            <span>
                              Switch to{" "}
                              {companyStore.sortOrder === "asc"
                                ? "Descending"
                                : "Ascending"}
                            </span>
                          </SortOptionGroup>
                        </DropdownItem>
                        <DropdownSeparator />
                      </>
                    )}

                    {sortOptions.map((option) => (
                      <DropdownItem
                        key={option.key}
                        $isActive={companyStore.sortBy === option.key}
                        onSelect={() =>
                          handleSort(option.key as typeof companyStore.sortBy)
                        }
                      >
                        <span>{option.label}</span>
                        {companyStore.sortBy === option.key && getSortIcon()}
                      </DropdownItem>
                    ))}

                    {hasActiveSort && (
                      <>
                        <DropdownSeparator />
                        <ClearItem onSelect={handleClearSort}>
                          <SortOptionGroup>
                            <X size={16} />
                            <span>Clear Sort</span>
                          </SortOptionGroup>
                        </ClearItem>
                      </>
                    )}
                  </DropdownContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </SearchAndSortGroup>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {selectedCompanies.size > 0 && (
                <Button variant="danger" onClick={handleBulkDelete}>
                  <Trash2 size={16} />
                  Delete Selected ({selectedCompanies.size})
                </Button>
              )}
              <Button onClick={handleAddCompany}>Add New Company</Button>
            </div>
          </TableHeader>
          <CompanyList
            onCompanyEdit={handleCompanyEdit}
            selectedCompanies={selectedCompanies}
            onSelectionChange={setSelectedCompanies}
            visibleColumns={visibleColumns}
          />
        </TableSection>
      </Container>

      <Dialog.Root
        open={companyFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCompanyFormClose();
          }
        }}
      >
        <Dialog.Portal>
          <DialogOverlay />
          <DialogContent style={{ maxWidth: "600px", padding: "0" }}>
            <CompanyForm
              company={editingCompany || undefined}
              onSave={handleCompanyFormSave}
              onCancel={handleCompanyFormClose}
            />
          </DialogContent>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        open={bulkDeleteConfirmOpen}
        onOpenChange={setBulkDeleteConfirmOpen}
      >
        <Dialog.Portal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>
              {selectedCompanies.size === 1
                ? "Delete Company"
                : "Delete Multiple Companies"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCompanies.size} compan
              {selectedCompanies.size === 1 ? "y" : "ies"}? This action cannot be
              undone.
            </DialogDescription>
            <DialogActions>
              <Dialog.Close asChild>
                <Button>Cancel</Button>
              </Dialog.Close>
              <Button variant="danger" onClick={confirmBulkDelete}>
                Delete {selectedCompanies.size} Compan
                {selectedCompanies.size === 1 ? "y" : "ies"}
              </Button>
            </DialogActions>
          </DialogContent>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
});