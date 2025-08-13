import { useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { useStore } from "../hooks/useStore";
import { StatusBadge } from "./StatusBadge";
import { CallLogForm } from "./CallLogForm";
import type { Lead, CallLog } from "../types";

interface LeadDetailViewProps {
  lead: Lead;
  onEdit: () => void;
  onClose: () => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const LeadInfo = styled.div`
  flex: 1;
`;

const LeadName = styled.h1`
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 28px;
  font-weight: 700;
`;

const LeadCompany = styled.h2`
  margin: 0 0 16px 0;
  color: #6b7280;
  font-size: 20px;
  font-weight: 500;
`;

const ContactInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
  margin-bottom: 16px;
`;

const LeadMetrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px 24px;
  margin-bottom: 16px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 14px;
`;

const ContactLabel = styled.span`
  font-weight: 600;
  min-width: 60px;
`;

const Notes = styled.div`
  margin-top: 16px;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
`;

const NotesLabel = styled.div`
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
`;

const NotesText = styled.div`
  color: #6b7280;
  font-size: 14px;
  white-space: pre-wrap;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" }>`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.$variant === "primary"
      ? `
    background-color: #3b82f6;
    color: white;
    border: 1px solid #3b82f6;
    
    &:hover {
      background-color: #2563eb;
      border-color: #2563eb;
    }
  `
      : `
    background-color: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background-color: #f3f4f6;
    }
  `}
`;

const Section = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
`;

const SectionTitle = styled.h3`
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
  flex: 1;
`;

const CallHistoryList = styled.div`
  display: flex;
  flex-direction: column;
`;

const CallHistoryItem = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const CallHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CallType = styled.span<{ $type: string }>`
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  text-transform: capitalize;
  background-color: ${(props) => {
    switch (props.$type) {
      case "call":
        return "#dbeafe";
      case "meeting":
        return "#dcfce7";
      case "follow-up":
        return "#fef3c7";
      default:
        return "#f3f4f6";
    }
  }};
  color: ${(props) => {
    switch (props.$type) {
      case "call":
        return "#1d4ed8";
      case "meeting":
        return "#166534";
      case "follow-up":
        return "#d97706";
      default:
        return "#374151";
    }
  }};
`;

const CallDate = styled.span`
  color: #6b7280;
  font-size: 14px;
`;

const CallDetails = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4b5563;
`;

const CallOutcome = styled.span<{ $outcome: string }>`
  font-weight: 600;
  color: ${(props) => {
    switch (props.$outcome) {
      case "connected":
      case "meeting-scheduled":
        return "#059669";
      case "voicemail":
      case "callback-requested":
        return "#d97706";
      case "not-interested":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  }};
`;

const CallNotes = styled.div`
  color: #6b7280;
  font-size: 14px;
  margin-top: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const formatOutcome = (outcome: string) => {
  return outcome.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export const LeadDetailView: React.FC<LeadDetailViewProps> = observer(
  ({ lead, onEdit, onClose }) => {
    const { callLogStore } = useStore();
    const [showCallLogForm, setShowCallLogForm] = useState(false);

    const callHistory = callLogStore.getCallLogsByLeadId(lead.id);

    const handleCallLogSave = (success: boolean) => {
      if (success) {
        setShowCallLogForm(false);
      }
    };

    return (
      <>
        <Container>
          <Header>
            <LeadInfo>
              <LeadName>{lead.name}</LeadName>
              <LeadCompany>{lead.company}</LeadCompany>
              <StatusBadge status={lead.status} size="large" />

              <ContactInfo>
                <ContactItem>
                  <ContactLabel>Phone:</ContactLabel>
                  <span>{lead.phone}</span>
                </ContactItem>
                <ContactItem>
                  <ContactLabel>Email:</ContactLabel>
                  <span>{lead.email}</span>
                </ContactItem>
                <ContactItem>
                  <ContactLabel>Added:</ContactLabel>
                  <span>{formatDateTime(lead.createdAt)}</span>
                </ContactItem>
                <ContactItem>
                  <ContactLabel>Owner:</ContactLabel>
                  <span>{lead.accountOwner}</span>
                </ContactItem>
                {lead.lastContactedAt && (
                  <ContactItem>
                    <ContactLabel>Last Contact:</ContactLabel>
                    <span>{formatDateTime(lead.lastContactedAt)}</span>
                  </ContactItem>
                )}
              </ContactInfo>

              <LeadMetrics>
                <ContactItem>
                  <ContactLabel>Deal Stage:</ContactLabel>
                  <span style={{ textTransform: "capitalize" }}>
                    {lead.dealStage.replace("-", " ")}
                  </span>
                </ContactItem>
                <ContactItem>
                  <ContactLabel>Opportunity:</ContactLabel>
                  <span>{lead.opportunitySize}</span>
                </ContactItem>
                <ContactItem>
                  <ContactLabel>Products:</ContactLabel>
                  <span>
                    {lead.products?.length > 0
                      ? lead.products.join(", ")
                      : "None"}
                  </span>
                </ContactItem>
              </LeadMetrics>

              {lead.notes && (
                <Notes>
                  <NotesLabel>Notes</NotesLabel>
                  <NotesText>{lead.notes}</NotesText>
                </Notes>
              )}
            </LeadInfo>

            <ButtonGroup>
              <Button onClick={onEdit}>Edit Lead</Button>
              <Button
                $variant="primary"
                onClick={() => setShowCallLogForm(true)}
              >
                Log Call
              </Button>
              <Button onClick={onClose}>Close</Button>
            </ButtonGroup>
          </Header>

          <Section>
            <SectionHeader>
              <SectionTitle>Call History ({callHistory.length})</SectionTitle>
              <Button
                $variant="primary"
                onClick={() => setShowCallLogForm(true)}
              >
                Log New Call
              </Button>
            </SectionHeader>

            <CallHistoryList>
              {callHistory.length === 0 ? (
                <EmptyState>
                  No calls logged yet. Click "Log Call" to record your first
                  interaction.
                </EmptyState>
              ) : (
                callHistory.map((call: CallLog) => (
                  <CallHistoryItem key={call.id}>
                    <CallHeader>
                      <div>
                        <CallType $type={call.type}>{call.type}</CallType>
                      </div>
                      <CallDate>{formatDateTime(new Date(call.date))}</CallDate>
                    </CallHeader>

                    <CallDetails>
                      <span>Duration: {call.duration} min</span>
                      <CallOutcome $outcome={call.outcome ?? "connected"}>
                        {formatOutcome(call.outcome ?? "connected")}
                      </CallOutcome>
                    </CallDetails>

                    {call.notes && <CallNotes>{call.notes}</CallNotes>}

                    {call.nextAction && (
                      <CallNotes>
                        <strong>Next Action:</strong> {call.nextAction}
                      </CallNotes>
                    )}

                    {call.scheduledFollowUp && (
                      <CallNotes>
                        <strong>Follow-up Scheduled:</strong>{" "}
                        {formatDateTime(new Date(call.scheduledFollowUp))}
                      </CallNotes>
                    )}
                  </CallHistoryItem>
                ))
              )}
            </CallHistoryList>
          </Section>
        </Container>

        {showCallLogForm && (
          <Modal>
            <CallLogForm
              selectedLead={lead}
              onSave={handleCallLogSave}
              onCancel={() => setShowCallLogForm(false)}
            />
          </Modal>
        )}
      </>
    );
  }
);
