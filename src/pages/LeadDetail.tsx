import { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowLeft, Plus } from 'lucide-react'
import { useStore } from '../hooks/useStore'
import { CallLogForm } from '../components/CallLogForm'
import { CallLogThread } from '../components/CallLogThread'
import { StatusBadge } from '../components/StatusBadge'
import type { Lead, CallLog } from '../types'

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
  }
`

const LeadHeader = styled.div`
  flex: 1;
`

const LeadName = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
`

const LeadCompany = styled.h2`
  margin: 4px 0 0 0;
  font-size: 18px;
  font-weight: 500;
  color: #6b7280;
`

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Section = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
`

const SectionTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px 24px;
  align-items: center;
`

const Label = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
`

const Value = styled.span`
  font-size: 14px;
  color: #111827;
`

const ContactValue = styled.a`
  font-size: 14px;
  color: #3b82f6;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`

const LogCallButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`

const DialogOverlay = styled(Dialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  z-index: 1000;
`

const DialogContent = styled(Dialog.Content)`
  background-color: white;
  border-radius: 6px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 500px;
  max-height: 85vh;
  padding: 0;
  z-index: 1001;
`

const formatDate = (date: Date | null) => {
  if (!date) return 'Never'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}


export const LeadDetail: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { leadStore, callLogStore } = useStore()
  const [lead, setLead] = useState<Lead | null>(null)
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [callLogModalOpen, setCallLogModalOpen] = useState(false)

  useEffect(() => {
    if (id) {
      const foundLead = leadStore.getLeadById(id)
      if (foundLead) {
        setLead(foundLead)
        // Load call logs for this lead
        const logs = callLogStore.getCallLogsByLeadId(id)
        setCallLogs(logs)
      } else {
        // Lead not found, redirect back
        navigate('/leads')
      }
    }
  }, [id, leadStore, callLogStore, navigate])

  const handleCallLogSave = (success: boolean) => {
    if (success) {
      setCallLogModalOpen(false)
      // Refresh call logs
      if (id) {
        const logs = callLogStore.getCallLogsByLeadId(id)
        setCallLogs(logs)
      }
    }
  }

  if (!lead) {
    return <div>Loading...</div>
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/leads')}>
          <ArrowLeft size={16} />
          Back to Leads
        </BackButton>
        <LeadHeader>
          <LeadName>{lead.name}</LeadName>
          <LeadCompany>{lead.company}</LeadCompany>
        </LeadHeader>
        <StatusBadge status={lead.status} />
      </Header>

      <Content>
        <Section>
          <SectionTitle>Contact Information</SectionTitle>
          <DetailGrid>
            <Label>Email:</Label>
            <ContactValue href={`mailto:${lead.email}`}>
              {lead.email || 'Not provided'}
            </ContactValue>

            <Label>Phone:</Label>
            <ContactValue href={`tel:${lead.phone}`}>
              {lead.phone || 'Not provided'}
            </ContactValue>

            <Label>Account Owner:</Label>
            <Value>{lead.accountOwner}</Value>

            <Label>Created By:</Label>
            <Value>{lead.createdBy}</Value>

            <Label>Created:</Label>
            <Value>{formatDate(lead.createdAt)}</Value>

            <Label>Last Updated:</Label>
            <Value>{formatDate(lead.updatedAt)}</Value>

            <Label>Last Contacted:</Label>
            <Value>{formatDate(lead.lastContactedAt)}</Value>
          </DetailGrid>

          {lead.notes && (
            <>
              <Label style={{ marginTop: '20px', display: 'block' }}>Notes:</Label>
              <Value style={{ marginTop: '8px', display: 'block', lineHeight: '1.5' }}>
                {lead.notes}
              </Value>
            </>
          )}
        </Section>

        <Section>
          <SectionTitle>
            Communication History
            <LogCallButton onClick={() => setCallLogModalOpen(true)}>
              <Plus size={16} />
              Log Communication
            </LogCallButton>
          </SectionTitle>
          <CallLogThread callLogs={callLogs} />
        </Section>
      </Content>

      {/* Call Log Modal */}
      <Dialog.Root open={callLogModalOpen} onOpenChange={setCallLogModalOpen}>
        <Dialog.Portal>
          <DialogOverlay />
          <DialogContent>
            <CallLogForm
              leadId={lead.id}
              onSave={handleCallLogSave}
              onCancel={() => setCallLogModalOpen(false)}
            />
          </DialogContent>
        </Dialog.Portal>
      </Dialog.Root>
    </Container>
  )
})