import { useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import * as Popover from "@radix-ui/react-popover";
import { Filter } from "lucide-react";
import { useStore } from "../hooks/useStore";
import { FilterPopover } from "./FilterPopover";

interface FilterButtonProps {
  className?: string;
}

const FilterTrigger = styled.button<{ $hasActiveFilters?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: ${(props) =>
    props.$hasActiveFilters ? "#eff6ff" : "white"};
  border: 1px solid
    ${(props) => (props.$hasActiveFilters ? "#3b82f6" : "#d1d5db")};
  border-radius: 6px;
  font-size: 14px;
  color: ${(props) => (props.$hasActiveFilters ? "#3b82f6" : "#374151")};
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

  &[data-state="open"] {
    background-color: #eff6ff;
    border-color: #3b82f6;
    color: #3b82f6;
  }
`;

const FilterCount = styled.span`
  background-color: #3b82f6;
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

export const FilterButton: React.FC<FilterButtonProps> = observer(
  ({ className }) => {
    const { leadStore } = useStore();
    const [isOpen, setIsOpen] = useState(false);

    const hasActiveFilters = leadStore.filters.length > 0;

    return (
      <Container className={className}>
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
          <Popover.Trigger asChild>
            <FilterTrigger $hasActiveFilters={hasActiveFilters}>
              <Filter size={16} />
              Filter
              {hasActiveFilters && (
                <FilterCount>{leadStore.filters.length}</FilterCount>
              )}
            </FilterTrigger>
          </Popover.Trigger>

          <Popover.Portal>
            <FilterPopover onClose={() => setIsOpen(false)} />
          </Popover.Portal>
        </Popover.Root>
      </Container>
    );
  }
);
