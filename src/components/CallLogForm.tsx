import { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import * as Select from '@radix-ui/react-select'
import * as Popover from '@radix-ui/react-popover'
import { DayPicker } from 'react-day-picker'
import { Calendar, ChevronDown } from 'lucide-react'
import { useStore } from '../hooks/useStore'
import type { CallLog, CallLogType, CallOutcome, Lead } from '../types'
import 'react-day-picker/dist/style.css'

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
  background-color: var(--background-primary);
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
  color: var(--text-primary);
  font-size: 14px;
`

const SelectTrigger = styled(Select.Trigger)<{ $hasError?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid ${props => props.$hasError ? 'var(--error)' : 'var(--border-color)'};
  border-radius: 6px;
  font-size: 14px;
  background-color: var(--background-primary);
  color: var(--text-primary);
  cursor: pointer;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? 'var(--error)' : 'var(--accent-primary)'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }
  
  &[data-placeholder] {
    color: var(--text-muted);
  }
`

const SelectContent = styled(Select.Content)`
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 4px;
  z-index: 1002;
`

const SelectItem = styled(Select.Item)`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 4px;
  outline: none;
  
  &:hover, &[data-highlighted] {
    background-color: var(--background-hover);
  }
  
  &[data-state="checked"] {
    background-color: var(--accent-primary);
    color: white;
  }
`

const SelectIcon = styled(Select.Icon)`
  color: var(--text-muted);
`

const DateButton = styled.button<{ $hasError?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid ${props => props.$hasError ? 'var(--error)' : 'var(--border-color)'};
  border-radius: 6px;
  font-size: 14px;
  background-color: var(--background-primary);
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? 'var(--error)' : 'var(--accent-primary)'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }
  
  &:hover {
    background-color: var(--background-hover);
  }
`

const DatePickerPopover = styled(Popover.Content)`
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 1002;
`

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  background-color: var(--background-primary);
  color: var(--text-primary);
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const ErrorMessage = styled.span`
  color: var(--error);
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
    background-color: var(--accent-primary);
    color: white;
    border: 1px solid var(--accent-primary);
    
    &:hover:not(:disabled) {
      background-color: var(--accent-hover);
      border-color: var(--accent-hover);
    }
    
    &:disabled {
      background-color: var(--text-muted);
      border-color: var(--text-muted);
      cursor: not-allowed;
    }
  ` : `
    background-color: var(--background-primary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    
    &:hover {
      background-color: var(--background-hover);
    }
  `}
`

const FormTitle = styled.h2`
  margin: 0 0 16px 0;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 700;
`


interface FormData {
  type: CallLogType
  date: Date | null
  outcome: CallOutcome
  notes: string
  caller: string
}

interface FormErrors {
  date?: string
  outcome?: string
}

const formatDateDisplay = (date: Date | null) => {
  if (!date) return 'Select date'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
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
    type: callLog?.type || 'call',
    date: callLog ? new Date(callLog.date) : new Date(),
    outcome: callLog?.outcome || 'connected',
    notes: callLog?.notes || '',
    caller: callLog?.caller || 'Sammy'
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (callLog) {
      setFormData({
        type: callLog.type,
        date: new Date(callLog.date),
        outcome: callLog.outcome || 'connected',
        notes: callLog.notes,
        caller: callLog.caller
      })
    }
  }, [callLog])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.date) {
      newErrors.date = 'Date is required'
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
        leadId: leadId || callLog?.leadId || '',
        type: formData.type,
        date: formData.date || new Date(),
        outcome: formData.outcome || undefined,
        notes: formData.notes.trim(),
        otherPeople: '',
        caller: formData.caller
      }

      if (callLog) {
        // Update existing call log
        const success = callLogStore.updateCallLog(callLog.id, callLogData)
        onSave(success)
      } else {
        // Create new call log
        callLogStore.addCallLog(callLogData)
        // Update lead's last contacted date
        leadStore.updateLastContacted(callLogData.leadId, formData.date || new Date())
        onSave(true)
      }
    } catch {
      onSave(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const selectedLeadData = selectedLead || (leadId ? leadStore.getLeadById(leadId) : undefined)

  return (
    <Form onSubmit={handleSubmit}>
      <FormTitle>
        {callLog ? 'Edit Call Log' : `Log New Call${selectedLeadData ? ` for ${selectedLeadData.name}` : ''}`}
      </FormTitle>


      <FormRow>
        <FormGroup>
          <Label>Communication Type</Label>
          <Select.Root value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <SelectTrigger>
              <Select.Value placeholder="Select type..." />
              <SelectIcon>
                <ChevronDown size={16} />
              </SelectIcon>
            </SelectTrigger>
            <Select.Portal>
              <SelectContent>
                <Select.Viewport>
                  <SelectItem value="email">
                    <Select.ItemText>Email</Select.ItemText>
                  </SelectItem>
                  <SelectItem value="call">
                    <Select.ItemText>Phone Call</Select.ItemText>
                  </SelectItem>
                  <SelectItem value="whatsapp">
                    <Select.ItemText>WhatsApp</Select.ItemText>
                  </SelectItem>
                  <SelectItem value="conference-call">
                    <Select.ItemText>Conference Call</Select.ItemText>
                  </SelectItem>
                  <SelectItem value="physical-meeting">
                    <Select.ItemText>Physical Meeting</Select.ItemText>
                  </SelectItem>
                  <SelectItem value="others">
                    <Select.ItemText>Others</Select.ItemText>
                  </SelectItem>
                </Select.Viewport>
              </SelectContent>
            </Select.Portal>
          </Select.Root>
        </FormGroup>

        <FormGroup>
          <Label>Caller</Label>
          <Select.Root value={formData.caller} onValueChange={(value) => handleInputChange('caller', value)}>
            <SelectTrigger>
              <Select.Value placeholder="Select caller..." />
              <SelectIcon>
                <ChevronDown size={16} />
              </SelectIcon>
            </SelectTrigger>
            <Select.Portal>
              <SelectContent>
                <Select.Viewport>
                  <SelectItem value="Sammy">
                    <Select.ItemText>Sammy</Select.ItemText>
                  </SelectItem>
                  <SelectItem value="John">
                    <Select.ItemText>John</Select.ItemText>
                  </SelectItem>
                  <SelectItem value="Sarah">
                    <Select.ItemText>Sarah</Select.ItemText>
                  </SelectItem>
                  <SelectItem value="Mike">
                    <Select.ItemText>Mike</Select.ItemText>
                  </SelectItem>
                </Select.Viewport>
              </SelectContent>
            </Select.Portal>
          </Select.Root>
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Label>Outcome *</Label>
          <Select.Root value={formData.outcome} onValueChange={(value) => handleInputChange('outcome', value)}>
            <SelectTrigger $hasError={!!errors.outcome}>
              <Select.Value placeholder="Select outcome..." />
              <SelectIcon>
                <ChevronDown size={16} />
              </SelectIcon>
            </SelectTrigger>
            <Select.Portal>
              <SelectContent>
                <Select.Viewport>
                  <SelectItem value="connected">
                    <Select.ItemText>Connected</Select.ItemText>
                  </SelectItem>
                  <SelectItem value="voicemail">
                    <Select.ItemText>Voicemail</Select.ItemText>
                  </SelectItem>
                  <SelectItem value="no-answer">
                    <Select.ItemText>No Answer</Select.ItemText>
                  </SelectItem>
                  <SelectItem value="busy">
                    <Select.ItemText>Busy</Select.ItemText>
                  </SelectItem>
                  <SelectItem value="meeting-scheduled">
                    <Select.ItemText>Meeting Scheduled</Select.ItemText>
                  </SelectItem>
                  <SelectItem value="not-interested">
                    <Select.ItemText>Not Interested</Select.ItemText>
                  </SelectItem>
                  <SelectItem value="callback-requested">
                    <Select.ItemText>Callback Requested</Select.ItemText>
                  </SelectItem>
                </Select.Viewport>
              </SelectContent>
            </Select.Portal>
          </Select.Root>
          {errors.outcome && <ErrorMessage>{errors.outcome}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Date *</Label>
          <Popover.Root>
            <Popover.Trigger asChild>
              <DateButton $hasError={!!errors.date}>
                <Calendar size={16} />
                {formatDateDisplay(formData.date)}
              </DateButton>
            </Popover.Trigger>
            <Popover.Portal>
              <DatePickerPopover>
                <DayPicker
                  mode="single"
                  selected={formData.date || undefined}
                  onSelect={(date) => handleInputChange('date', date || null)}
                  showOutsideDays
                />
              </DatePickerPopover>
            </Popover.Portal>
          </Popover.Root>
          {errors.date && <ErrorMessage>{errors.date}</ErrorMessage>}
        </FormGroup>
      </FormRow>


      <FormGroup>
        <Label htmlFor="notes">Notes</Label>
        <TextArea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Add notes about the communication..."
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