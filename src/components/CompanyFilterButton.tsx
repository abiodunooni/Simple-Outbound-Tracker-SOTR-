import { observer } from "mobx-react-lite";
import { useStore } from "../hooks/useStore";
import { UnifiedFilterButton } from "./UnifiedFilterButton";
import { CompanyFilterConditionRow } from "./CompanyFilterConditionRow";
import type { CompanyFilterCondition } from "../types";

interface CompanyFilterButtonProps {
  className?: string;
}

export const CompanyFilterButton: React.FC<CompanyFilterButtonProps> = observer(
  ({ className }) => {
    const { companyStore } = useStore();

    const handleAddFilter = () => {
      companyStore.addFilter({
        id: Date.now().toString(),
        field: 'name',
        operator: 'contains',
        value: '',
        dataType: 'text'
      });
    };

    const config = {
      filters: companyStore.filters,
      onAddFilter: handleAddFilter,
      onUpdateFilter: (id: string, updates: Partial<CompanyFilterCondition>) => 
        companyStore.updateFilter(id, updates),
      onRemoveFilter: (id: string) => companyStore.removeFilter(id),
      onClearAll: () => companyStore.clearFilters(),
      filteredCount: companyStore.filteredAndSortedCompanies.length,
      totalCount: companyStore.totalCompanies,
      title: "Filter Companies",
      emptyStateText: "No filters applied. Click \"Add Filter\" to get started.",
      resultText: "Showing {filteredCount} of {totalCount} companies",
      renderFilterRow: (filter: CompanyFilterCondition, _index: number, isFirst: boolean, onUpdate: (updates: Partial<CompanyFilterCondition>) => void, onRemove: () => void) => (
        <CompanyFilterConditionRow
          key={filter.id}
          condition={filter}
          isFirst={isFirst}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      )
    };

    return (
      <UnifiedFilterButton
        className={className}
        config={config}
      />
    );
  }
);