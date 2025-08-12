import styled from 'styled-components'
import type { LeadStatus } from '../types'

interface StatusBadgeProps {
  status: LeadStatus
  size?: 'small' | 'medium' | 'large'
}

const Badge = styled.span<{ $status: LeadStatus; $size: 'small' | 'medium' | 'large' }>`
  display: inline-block;
  padding: ${props => {
    switch (props.$size) {
      case 'small': return '4px 8px'
      case 'large': return '8px 16px'
      default: return '6px 12px'
    }
  }};
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '12px'
      case 'large': return '16px'
      default: return '14px'
    }
  }};
  font-weight: 600;
  border-radius: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: ${props => {
    switch (props.$status) {
      case 'Hot': return '#fee2e2'
      case 'Warm': return '#fef3c7'
      case 'Cold': return '#e0f2fe'
      default: return '#f3f4f6'
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'Hot': return '#dc2626'
      case 'Warm': return '#d97706'
      case 'Cold': return '#0284c7'
      default: return '#374151'
    }
  }};
  border: 1px solid ${props => {
    switch (props.$status) {
      case 'Hot': return '#fecaca'
      case 'Warm': return '#fde68a'
      case 'Cold': return '#bae6fd'
      default: return '#e5e7eb'
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