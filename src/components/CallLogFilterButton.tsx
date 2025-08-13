import { observer } from "mobx-react-lite";
import { UnifiedFilterButton } from "./UnifiedFilterButton";
import { CallLogFilterConditionRow } from "./CallLogFilterConditionRow";
import type { CallLogFilterCondition } from '../config/callLogFilterConfig'

interface CallLogFilterButtonProps {
  className?: string;
  filters: CallLogFilterCondition[]
  onAddFilter: () => void
  onUpdateFilter: (id: string, updates: Partial<CallLogFilterCondition>) => void
  onRemoveFilter: (id: string) => void
  onClearAll: () => void
  filteredCount: number
  totalCount: number
}

export const CallLogFilterButton: React.FC<CallLogFilterButtonProps> = observer(
  ({ className, filters, onAddFilter, onUpdateFilter, onRemoveFilter, onClearAll, filteredCount, totalCount }) => {
    const config = {
      filters,
      onAddFilter,
      onUpdateFilter,
      onRemoveFilter,
      onClearAll,
      filteredCount,
      totalCount,
      title: "Filter Call Logs",
      emptyStateText: "No filters applied. Click \"Add Filter\" to get started.",
      resultText: "Showing {filteredCount} of {totalCount} call logs",
      renderFilterRow: (filter: CallLogFilterCondition, _index: number, isFirst: boolean, onUpdate: (updates: Partial<CallLogFilterCondition>) => void, onRemove: () => void) => (
        <CallLogFilterConditionRow
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