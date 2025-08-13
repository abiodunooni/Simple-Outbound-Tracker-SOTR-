import { observer } from "mobx-react-lite";
import { useStore } from "../hooks/useStore";
import { UnifiedFilterButton } from "./UnifiedFilterButton";
import { FilterConditionRow } from "./FilterConditionRow";
import type { FilterCondition } from "../types";

interface FilterButtonProps {
  className?: string;
}

export const FilterButton: React.FC<FilterButtonProps> = observer(
  ({ className }) => {
    const { leadStore } = useStore();

    const handleAddFilter = () => {
      leadStore.addFilter({
        id: Date.now().toString(),
        field: 'name',
        operator: 'contains',
        value: '',
        dataType: 'text'
      });
    };

    const config = {
      filters: leadStore.filters,
      onAddFilter: handleAddFilter,
      onUpdateFilter: (id: string, updates: Partial<FilterCondition>) => 
        leadStore.updateFilter(id, updates),
      onRemoveFilter: (id: string) => leadStore.removeFilter(id),
      onClearAll: () => leadStore.clearFilters(),
      filteredCount: leadStore.filteredAndSortedLeads.length,
      totalCount: leadStore.totalLeads,
      title: "Filter Leads",
      emptyStateText: "No filters applied. Click \"Add Filter\" to get started.",
      resultText: "Showing {filteredCount} of {totalCount} leads",
      renderFilterRow: (filter: FilterCondition, _index: number, isFirst: boolean, onUpdate: (updates: Partial<FilterCondition>) => void, onRemove: () => void) => (
        <FilterConditionRow
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
