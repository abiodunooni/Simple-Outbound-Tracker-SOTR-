import { useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import * as Popover from "@radix-ui/react-popover";
import { Filter } from "lucide-react";

interface FilterButtonConfig<T> {
  filters: T[];
  onAddFilter: () => void;
  onUpdateFilter: (id: string, updates: Partial<T>) => void;
  onRemoveFilter: (id: string) => void;
  onClearAll: () => void;
  filteredCount: number;
  totalCount: number;
  title: string;
  emptyStateText: string;
  resultText: string;
  renderFilterRow: (filter: T, index: number, isFirst: boolean, onUpdate: (updates: Partial<T>) => void, onRemove: () => void) => React.ReactNode;
}

interface UnifiedFilterButtonProps<T> {
  className?: string;
  config: FilterButtonConfig<T>;
}

const FilterTrigger = styled.button<{ $hasActiveFilters?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: ${(props) =>
    props.$hasActiveFilters ? "var(--accent-primary)" : "var(--background-primary)"};
  border: 1px solid
    ${(props) => (props.$hasActiveFilters ? "var(--accent-primary)" : "var(--border-color)")};
  border-radius: 6px;
  font-size: 14px;
  color: ${(props) => (props.$hasActiveFilters ? "white" : "var(--text-primary)")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.$hasActiveFilters ? "var(--accent-hover)" : "var(--background-hover)")};
    border-color: var(--border-hover);
  }

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &[data-state="open"] {
    background-color: var(--accent-primary);
    border-color: var(--accent-primary);
    color: white;
  }
`;

const FilterCount = styled.span`
  background-color: var(--accent-primary);
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const PopoverContent = styled(Popover.Content)`
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 16px;
  min-width: 400px;
  max-width: 500px;
  z-index: 50;
  
  &:focus {
    outline: none;
  }
`;

const PopoverArrow = styled(Popover.Arrow)`
  fill: var(--background-primary);
  stroke: var(--border-color);
  stroke-width: 1;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background-color: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
          
          &:hover {
            background-color: var(--accent-hover);
            border-color: var(--accent-hover);
          }
        `;
      case 'danger':
        return `
          background-color: var(--error);
          color: white;
          border-color: var(--error);
          
          &:hover {
            opacity: 0.9;
          }
        `;
      default:
        return `
          background-color: var(--background-primary);
          color: var(--text-secondary);
          border-color: var(--border-color);
          
          &:hover {
            background-color: var(--background-hover);
          }
        `;
    }
  }}
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 60px;
  margin-bottom: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  padding: 24px;
  border: 2px dashed var(--border-color);
  border-radius: 6px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
`;

const ResultCount = styled.div`
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
`;

function UnifiedFilterButtonComponent<T extends { id: string }>({
  className,
  config
}: UnifiedFilterButtonProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    filters,
    onAddFilter,
    onUpdateFilter,
    onRemoveFilter,
    onClearAll,
    filteredCount,
    totalCount,
    title,
    emptyStateText,
    resultText,
    renderFilterRow
  } = config;

  const hasActiveFilters = filters.length > 0;

  return (
    <Container className={className}>
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <FilterTrigger $hasActiveFilters={hasActiveFilters}>
            <Filter size={16} />
            Filter
            {hasActiveFilters && (
              <FilterCount>{filters.length}</FilterCount>
            )}
          </FilterTrigger>
        </Popover.Trigger>

        <Popover.Portal>
          <PopoverContent align="start" sideOffset={4}>
            <PopoverArrow />
            
            <Header>
              <Title>{title}</Title>
              <HeaderActions>
                <Button onClick={onAddFilter}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Add Filter
                </Button>
                {hasActiveFilters && (
                  <Button $variant="danger" onClick={onClearAll}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2"/>
                    </svg>
                    Clear All
                  </Button>
                )}
              </HeaderActions>
            </Header>

            {hasActiveFilters && (
              <ResultCount>
                {resultText.replace('{filteredCount}', filteredCount.toString()).replace('{totalCount}', totalCount.toString())}
              </ResultCount>
            )}

            <FiltersContainer>
              {filters.length === 0 ? (
                <EmptyState>
                  {emptyStateText}
                </EmptyState>
              ) : (
                filters.map((filter, index) =>
                  renderFilterRow(
                    filter,
                    index,
                    index === 0,
                    (updates) => onUpdateFilter(filter.id, updates),
                    () => onRemoveFilter(filter.id)
                  )
                )
              )}
            </FiltersContainer>

            <Footer>
              <Button onClick={() => setIsOpen(false)}>
                Done
              </Button>
            </Footer>
          </PopoverContent>
        </Popover.Portal>
      </Popover.Root>
    </Container>
  );
}

export const UnifiedFilterButton = observer(UnifiedFilterButtonComponent) as <T extends { id: string }>(
  props: UnifiedFilterButtonProps<T>
) => React.JSX.Element;