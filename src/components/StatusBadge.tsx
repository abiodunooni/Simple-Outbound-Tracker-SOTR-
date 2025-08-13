import styled from 'styled-components'
import type { LeadStatus } from '../types'

interface StatusBadgeProps {
  status: LeadStatus
  size?: 'small' | 'medium' | 'large'
}

const Badge = styled.span<{ $status: LeadStatus; $size: 'small' | 'medium' | 'large' }>`
  display: inline-block;
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '12px'
      case 'large': return '16px'
      default: return '14px'
    }
  }};
  font-weight: 500;
  text-transform: capitalize;
  color: ${props => {
    switch (props.$status) {
      case 'Hot': return '#dc2626'
      case 'Warm': return '#d97706'
      case 'Cold': return '#0284c7'
      default: return '#374151'
    }
  }};
`

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  return (
    <Badge $status={status} $size={size}>
      {status}
    </Badge>
  )
}