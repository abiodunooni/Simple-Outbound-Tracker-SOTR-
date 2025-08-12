import { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useStore } from '../hooks/useStore'
import type { CallLog, CallLogType, CallOutcome, Lead } from '../types'

interface CallLogFormProps {
  callLog?: CallLog
  selectedLead?: Lead
  leadId?: string
  onSave: (success: boolean) => void
  onCancel: () => void
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 500px;
  padding: 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 14px;
`

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 1px solid ${props => props.$hasError ? '#dc2626' : '#d1d5db'};
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#dc2626' : '#3b82f6'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }
`

const Select = styled.select<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 1px solid ${props => props.$hasError ? '#dc2626' : '#d1d5db'};
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#dc2626' : '#3b82f6'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }
`

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 12px;
  margin-top: -2px;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$variant === 'primary' ? `
    background-color: #3b82f6;
    color: white;
    border: 1px solid #3b82f6;
    
    &:hover:not(:disabled) {
      background-color: #2563eb;
      border-color: #2563eb;
    }
    
    &:disabled {
      background-color: #9ca3af;
      border-color: #9ca3af;
      cursor: not-allowed;
    }
  ` : `
    background-color: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background-color: #f3f4f6;
    }
  `}
`

const FormTitle = styled.h2`
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 700;
`

const LeadInfo = styled.div`
  padding: 12px 16px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 8px;
`

const LeadName = styled.span`
  font-weight: 600;
  color: #1f2937;
`

const LeadCompany = styled.span`
  color: #6b7280;
  margin-left: 8px;
`

interface FormData {
  leadId: string
  type: CallLogType
  date: string
  duration: string
  outcome: CallOutcome
  notes: string
  otherPeople: string
  nextAction: string
  scheduledFollowUp: string
}

interface FormErrors {
  leadId?: string
  date?: string
  duration?: string
  outcome?: string
}

const formatDateForInput = (date: Date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

export const CallLogForm: React.FC<CallLogFormProps> = observer(({ 
  callLog, 
  selectedLead,
  leadId,
  onSave, 
  onCancel 
}) => {
  const { leadStore, callLogStore } = useStore()
  
  const [formData, setFormData] = useState<FormData>({
    leadId: callLog?.leadId || selectedLead?.id || leadId || '',
    type: callLog?.type || 'call',
    date: callLog ? formatDateForInput(new Date(callLog.date)) : formatDateForInput(new Date()),
    duration: callLog?.duration?.toString() || '',
    outcome: callLog?.outcome || 'connected',
    notes: callLog?.notes || '',
    otherPeople: callLog?.otherPeople || '',
    nextAction: callLog?.nextAction || '',
    scheduledFollowUp: callLog?.scheduledFollowUp ? formatDateForInput(new Date(callLog.scheduledFollowUp)) : ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (callLog) {
      setFormData({
        leadId: callLog.leadId,
        type: callLog.type,
        date: formatDateForInput(new Date(callLog.date)),
        duration: callLog.duration?.toString() || '',
        outcome: callLog.outcome || 'connected',
        notes: callLog.notes,
        otherPeople: callLog.otherPeople,
        nextAction: callLog.nextAction || '',
        scheduledFollowUp: callLog.scheduledFollowUp ? formatDateForInput(new Date(callLog.scheduledFollowUp)) : ''
      })
    }
  }, [callLog])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.leadId) {
      newErrors.leadId = 'Please select a lead'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    if (!formData.duration) {
      newErrors.duration = 'Duration is required'
    } else if (isNaN(Number(formData.duration)) || Number(formData.duration) < 0) {
      newErrors.duration = 'Duration must be a valid number'
    }

    if (!formData.outcome) {
      newErrors.outcome = 'Outcome is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const callLogData = {
        leadId: formData.leadId,
        type: formData.type,
        date: new Date(formData.date),
        duration: formData.duration ? Number(formData.duration) : undefined,
        outcome: formData.outcome || undefined,
        notes: formData.notes.trim(),
        otherPeople: formData.otherPeople.trim(),
        nextAction: formData.nextAction.trim() || undefined,
        scheduledFollowUp: formData.scheduledFollowUp ? new Date(formData.scheduledFollowUp) : undefined
      }

      if (callLog) {
        // Update existing call log
        const success = callLogStore.updateCallLog(callLog.id, callLogData)
        onSave(success)
      } else {
        // Create new call log
        callLogStore.addCallLog(callLogData)
        // Update lead's last contacted date
        leadStore.updateLastContacted(formData.leadId, new Date(formData.date))
        onSave(true)
      }
    } catch {
      onSave(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const selectedLeadData = selectedLead || (formData.leadId ? leadStore.getLeadById(formData.leadId) : undefined)

  return (
    <Form onSubmit={handleSubmit}>
      <FormTitle>
        {callLog ? 'Edit Call Log' : 'Log New Call'}
      </FormTitle>

      {selectedLeadData && (
        <LeadInfo>
          <LeadName>{selectedLeadData.name}</LeadName>
          <LeadCompany>at {selectedLeadData.company}</LeadCompany>
        </LeadInfo>
      )}

      {!selectedLead && (
        <FormGroup>
          <Label htmlFor="leadId">Lead *</Label>
          <Select
            id="leadId"
            value={formData.leadId}
            onChange={(e) => handleInputChange('leadId', e.target.value)}
            $hasError={!!errors.leadId}
          >
            <option value="">Select a lead...</option>
            {leadStore.leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name} - {lead.company}
              </option>
            ))}
          </Select>
          {errors.leadId && <ErrorMessage>{errors.leadId}</ErrorMessage>}
        </FormGroup>
      )}

      <FormRow>
        <FormGroup>
          <Label htmlFor="type">Communication Type</Label>
          <Select
            id="type"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
          >
            <option value="email">Email</option>
            <option value="call">Phone Call</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="conference-call">Conference Call</option>
            <option value="physical-meeting">Physical Meeting</option>
            <option value="others">Others</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="outcome">Outcome *</Label>
          <Select
            id="outcome"
            value={formData.outcome}
            onChange={(e) => handleInputChange('outcome', e.target.value)}
            $hasError={!!errors.outcome}
          >
            <option value="connected">Connected</option>
            <option value="voicemail">Voicemail</option>
            <option value="no-answer">No Answer</option>
            <option value="busy">Busy</option>
            <option value="meeting-scheduled">Meeting Scheduled</option>
            <option value="not-interested">Not Interested</option>
            <option value="callback-requested">Callback Requested</option>
          </Select>
          {errors.outcome && <ErrorMessage>{errors.outcome}</ErrorMessage>}
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Label htmlFor="date">Date & Time *</Label>
          <Input
            id="date"
            type="datetime-local"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            $hasError={!!errors.date}
          />
          {errors.date && <ErrorMessage>{errors.date}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="duration">Duration (minutes) *</Label>
          <Input
            id="duration"
            type="number"
            min="0"
            step="1"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', e.target.value)}
            $hasError={!!errors.duration}
            placeholder="0"
          />
          {errors.duration && <ErrorMessage>{errors.duration}</ErrorMessage>}
        </FormGroup>
      </FormRow>

      <FormGroup>
        <Label htmlFor="otherPeople">Other People Involved</Label>
        <Input
          id="otherPeople"
          type="text"
          value={formData.otherPeople}
          onChange={(e) => handleInputChange('otherPeople', e.target.value)}
          placeholder="e.g., John Smith, Sarah Jones"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="notes">Notes</Label>
        <TextArea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Add notes about the communication..."
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="nextAction">Next Action</Label>
        <Input
          id="nextAction"
          type="text"
          value={formData.nextAction}
          onChange={(e) => handleInputChange('nextAction', e.target.value)}
          placeholder="What's the next step with this lead?"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="scheduledFollowUp">Scheduled Follow-up</Label>
        <Input
          id="scheduledFollowUp"
          type="datetime-local"
          value={formData.scheduledFollowUp}
          onChange={(e) => handleInputChange('scheduledFollowUp', e.target.value)}
        />
      </FormGroup>

      <ButtonGroup>
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" $variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (callLog ? 'Update Call Log' : 'Log Call')}
        </Button>
      </ButtonGroup>
    </Form>
  )
})