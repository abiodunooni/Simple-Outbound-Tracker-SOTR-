import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import * as Popover from '@radix-ui/react-popover'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '../hooks/useStore'
import { FilterConditionRow } from './FilterConditionRow'

interface FilterPopoverProps {
  onClose: () => void
}

const PopoverContent = styled(Popover.Content)`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 16px;
  min-width: 400px;
  max-width: 500px;
  z-index: 50;
  
  &:focus {
    outline: none;
  }
`

const PopoverArrow = styled(Popover.Arrow)`
  fill: white;
  stroke: #e2e8f0;
  stroke-width: 1;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
`

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
`

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`

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
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
          
          &:hover {
            background-color: #2563eb;
            border-color: #2563eb;
          }
        `
      case 'danger':
        return `
          background-color: #dc2626;
          color: white;
          border-color: #dc2626;
          
          &:hover {
            background-color: #b91c1c;
            border-color: #b91c1c;
          }
        `
      default:
        return `
          background-color: white;
          color: #374151;
          border-color: #d1d5db;
          
          &:hover {
            background-color: #f3f4f6;
          }
        `
    }
  }}
`

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 60px;
  margin-bottom: 16px;
`

const EmptyState = styled.div`
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  padding: 24px;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
`

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
`

const ResultCount = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
`

export const FilterPopover: React.FC<FilterPopoverProps> = observer(({ onClose }) => {
  const { leadStore } = useStore()

  const handleAddFilter = () => {
    leadStore.addFilter({
      id: Date.now().toString(),
      field: 'name',
      operator: 'contains',
      value: '',
      dataType: 'text'
    })
  }

  const handleClearAll = () => {
    leadStore.clearFilters()
  }


  const filteredCount = leadStore.filteredAndSortedLeads.length
  const totalCount = leadStore.totalLeads
  const hasFilters = leadStore.filters.length > 0

  return (
    <PopoverContent align="start" sideOffset={4}>
      <PopoverArrow />
      
      <Header>
        <Title>Filter Leads</Title>
        <HeaderActions>
          <Button onClick={handleAddFilter}>
            <Plus size={16} />
            Add Filter
          </Button>
          {hasFilters && (
            <Button $variant="danger" onClick={handleClearAll}>
              <Trash2 size={16} />
              Clear All
            </Button>
          )}
        </HeaderActions>
      </Header>

      {hasFilters && (
        <ResultCount>
          Showing {filteredCount} of {totalCount} leads
        </ResultCount>
      )}

      <FiltersContainer>
        {leadStore.filters.length === 0 ? (
          <EmptyState>
            No filters applied. Click "Add Filter" to get started.
          </EmptyState>
        ) : (
          leadStore.filters.map((filter, index) => (
            <FilterConditionRow
              key={filter.id}
              condition={filter}
              isFirst={index === 0}
              onUpdate={(updates) => leadStore.updateFilter(filter.id, updates)}
              onRemove={() => leadStore.removeFilter(filter.id)}
            />
          ))
        )}
      </FiltersContainer>

      <Footer>
        <Button onClick={onClose}>
          Done
        </Button>
      </Footer>
    </PopoverContent>
  )
})