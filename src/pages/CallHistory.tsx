import { useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { useStore } from "../hooks/useStore";
import { CallLogForm } from "../components/CallLogForm";
import { LeadDetailView } from "../components/LeadDetailView";
import type { CallLog, CallLogType, CallOutcome, Lead } from "../types";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const PageTitle = styled.h1`
  margin: 0;
  color: #1f2937;
  font-size: 32px;
  font-weight: 700;
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" }>`
  padding: 12px 24px;
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

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const StatsBar = styled.div`
  display: flex;
  gap: 24px;
  padding: 16px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const StatValue = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CallLogList = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const CallLogItem = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8fafc;
  }
`;

const CallLogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const LeadInfo = styled.div`
  flex: 1;
`;

const LeadName = styled.span`
  font-weight: 700;
  color: #1f2937;
  font-size: 16px;
`;

const LeadCompany = styled.span`
  color: #6b7280;
  margin-left: 8px;
`;

const CallMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
`;

const CallType = styled.span<{ $type: CallLogType }>`
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
      case "physical-meeting":
        return "#dcfce7";
      case "conference-call":
        return "#fef3c7";
      default:
        return "#f3f4f6";
    }
  }};
  color: ${(props) => {
    switch (props.$type) {
      case "call":
        return "#1d4ed8";
      case "physical-meeting":
        return "#166534";
      case "conference-call":
        return "#d97706";
      default:
        return "#374151";
    }
  }};
`;

const CallOutcomeSpan = styled.span<{ $outcome: CallOutcome }>`
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

const CallDateTime = styled.div`
  text-align: right;
  color: #6b7280;
  font-size: 14px;
`;

const CallNotes = styled.div`
  color: #4b5563;
  font-size: 14px;
  margin-top: 8px;
  line-height: 1.5;
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
  padding: 24px;
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

export const CallHistory: React.FC = observer(() => {
  const { leadStore, callLogStore } = useStore();
  const [showCallLogForm, setShowCallLogForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadDetail, setShowLeadDetail] = useState(false);

  const handleCallLogSave = (success: boolean) => {
    if (success) {
      setShowCallLogForm(false);
    }
  };

  const handleCallLogClick = (callLog: CallLog) => {
    const lead = leadStore.getLeadById(callLog.leadId);
    if (lead) {
      setSelectedLead(lead);
      setShowLeadDetail(true);
    }
  };

  const handleLeadEdit = () => {
    setShowLeadDetail(false);
    // Could navigate to leads page or show lead form here
  };

  const handleLeadDetailClose = () => {
    setShowLeadDetail(false);
    setSelectedLead(null);
  };

  const exportCallLogs = () => {
    const callLogs = callLogStore.filteredAndSortedCallLogs;
    const csvHeaders = [
      "Lead Name",
      "Company",
      "Type",
      "Date",
      "Duration (min)",
      "Outcome",
      "Notes",
      "Next Action",
    ];
    const csvRows = callLogs.map((callLog) => {
      const lead = leadStore.getLeadById(callLog.leadId);
      return [
        lead?.name || "Unknown Lead",
        lead?.company || "",
        callLog.type,
        new Date(callLog.date).toISOString(),
        (callLog.duration ?? 0).toString(),
        callLog.outcome,
        callLog.notes.replace(/"/g, '""'), // Escape quotes
        (callLog.nextAction ?? "").replace(/"/g, '""'),
      ];
    });

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `call-logs-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const callLogs = callLogStore.filteredAndSortedCallLogs;
  const totalCalls = callLogStore.totalCallLogs;
  const callsToday = callLogStore.callsToday.length;
  const callsThisWeek = callLogStore.callsThisWeek.length;
  const avgCallsPerDay = callLogStore.averageCallsPerDay;

  const totalDuration = callLogs.reduce((sum, call) => sum + (call.duration ?? 0), 0);
  const avgDuration =
    callLogs.length > 0 ? Math.round(totalDuration / callLogs.length) : 0;

  return (
    <>
      <Container>
        <Header>
          <PageTitle>Call History ({callLogs.length})</PageTitle>
          <div style={{ display: "flex", gap: "12px" }}>
            <Button onClick={exportCallLogs} disabled={totalCalls === 0}>
              Export CSV
            </Button>
            <Button $variant="primary" onClick={() => setShowCallLogForm(true)}>
              Log Call
            </Button>
          </div>
        </Header>

        {totalCalls > 0 && (
          <StatsBar>
            <StatItem>
              <StatValue>{totalCalls}</StatValue>
              <StatLabel>Total Calls</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{callsToday}</StatValue>
              <StatLabel>Today</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{callsThisWeek}</StatValue>
              <StatLabel>This Week</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{avgCallsPerDay}</StatValue>
              <StatLabel>Avg/Day</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>
                {Math.round((totalDuration / 60) * 10) / 10}h
              </StatValue>
              <StatLabel>Total Time</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{avgDuration}min</StatValue>
              <StatLabel>Avg Duration</StatLabel>
            </StatItem>
          </StatsBar>
        )}

        <FiltersContainer>
          <Select
            value={callLogStore.typeFilter}
            onChange={(e) =>
              callLogStore.setTypeFilter(e.target.value as CallLogType | "all")
            }
          >
            <option value="all">All Types</option>
            <option value="call">Phone Call</option>
            <option value="meeting">Meeting</option>
            <option value="follow-up">Follow-up</option>
          </Select>

          <Select
            value={callLogStore.outcomeFilter}
            onChange={(e) =>
              callLogStore.setOutcomeFilter(
                e.target.value as CallOutcome | "all"
              )
            }
          >
            <option value="all">All Outcomes</option>
            <option value="connected">Connected</option>
            <option value="voicemail">Voicemail</option>
            <option value="no-answer">No Answer</option>
            <option value="busy">Busy</option>
            <option value="meeting-scheduled">Meeting Scheduled</option>
            <option value="not-interested">Not Interested</option>
            <option value="callback-requested">Callback Requested</option>
          </Select>

          <Select
            value={`${callLogStore.sortBy}-${callLogStore.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("-");
              callLogStore.setSorting(
                sortBy as "date" | "duration",
                sortOrder as "asc" | "desc"
              );
            }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="duration-desc">Longest First</option>
            <option value="duration-asc">Shortest First</option>
          </Select>
        </FiltersContainer>

        <CallLogList>
          {callLogs.length === 0 ? (
            <EmptyState>
              {callLogStore.typeFilter !== "all" ||
              callLogStore.outcomeFilter !== "all"
                ? "No call logs match your filters"
                : 'No call logs yet. Click "Log Call" to record your first interaction.'}
            </EmptyState>
          ) : (
            callLogs.map((callLog: CallLog) => {
              const lead = leadStore.getLeadById(callLog.leadId);
              if (!lead) return null;

              return (
                <CallLogItem
                  key={callLog.id}
                  onClick={() => handleCallLogClick(callLog)}
                >
                  <CallLogHeader>
                    <LeadInfo>
                      <div>
                        <LeadName>{lead.name}</LeadName>
                        <LeadCompany>at {lead.company}</LeadCompany>
                      </div>
                      <CallMeta>
                        <CallType $type={callLog.type}>{callLog.type}</CallType>
                        <span>•</span>
                        <span>{callLog.duration} min</span>
                        <span>•</span>
                        <CallOutcomeSpan $outcome={callLog.outcome ?? "connected"}>
                          {formatOutcome(callLog.outcome ?? "connected")}
                        </CallOutcomeSpan>
                      </CallMeta>
                    </LeadInfo>
                    <CallDateTime>
                      {formatDateTime(new Date(callLog.date))}
                    </CallDateTime>
                  </CallLogHeader>

                  {callLog.notes && <CallNotes>{callLog.notes}</CallNotes>}

                  {callLog.nextAction && (
                    <CallNotes>
                      <strong>Next Action:</strong> {callLog.nextAction}
                    </CallNotes>
                  )}

                  {callLog.scheduledFollowUp && (
                    <CallNotes>
                      <strong>Follow-up Scheduled:</strong>{" "}
                      {formatDateTime(new Date(callLog.scheduledFollowUp))}
                    </CallNotes>
                  )}
                </CallLogItem>
              );
            })
          )}
        </CallLogList>
      </Container>

      {showCallLogForm && (
        <Modal>
          <CallLogForm
            onSave={handleCallLogSave}
            onCancel={() => setShowCallLogForm(false)}
          />
        </Modal>
      )}

      {showLeadDetail && selectedLead && (
        <Modal>
          <LeadDetailView
            lead={selectedLead}
            onEdit={handleLeadEdit}
            onClose={handleLeadDetailClose}
          />
        </Modal>
      )}
    </>
  );
});
