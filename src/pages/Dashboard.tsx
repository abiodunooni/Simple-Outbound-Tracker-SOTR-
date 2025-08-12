import { useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { useStore } from "../hooks/useStore";
import { StatusBadge } from "../components/StatusBadge";
import { LeadForm } from "../components/LeadForm";
import { CallLogForm } from "../components/CallLogForm";
import { LeadDetailView } from "../components/LeadDetailView";
import type { Lead, CallLog } from "../types";

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const BalanceSection = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const MainBalance = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const BalanceAmount = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: #111827;
`;

const BalanceChange = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #10b981;
  font-weight: 600;
`;

const ChartPlaceholder = styled.div`
  height: 200px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 12px;
  margin: 24px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
`;

const TimeFilters = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const TimeFilter = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  background: ${(props) => (props.$active ? "#3b82f6" : "transparent")};
  color: ${(props) => (props.$active ? "white" : "#6b7280")};
  border: 1px solid ${(props) => (props.$active ? "#3b82f6" : "#d1d5db")};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? "#2563eb" : "#f3f4f6")};
  }
`;

const AssetsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

const AssetCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AssetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AssetIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const AssetDetails = styled.div``;

const AssetType = styled.div`
  font-weight: 600;
  color: #111827;
  font-size: 16px;
`;

const AssetBalance = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-top: 2px;
`;

const AssetAllocation = styled.div`
  text-align: right;
`;

const AllocationValue = styled.div`
  font-weight: 600;
  color: #111827;
`;

const QuickActionsSection = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  margin: 0 0 24px 0;
  color: #111827;
  font-size: 20px;
  font-weight: 600;
`;

const QuickActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ActionCard = styled.button`
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
`;

const ActionIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 8px;
`;

const ActionText = styled.div`
  color: #111827;
  font-weight: 600;
  font-size: 14px;
`;

const RecentActivitySection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActivityCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const ActivityHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
`;

const ActivityTitle = styled.h3`
  margin: 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
`;

const ActivityList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  padding: 12px 20px;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8fafc;
    cursor: pointer;
  }
`;

const ActivityItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const ActivityItemName = styled.span`
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
`;

const ActivityItemCompany = styled.span`
  color: #6b7280;
  font-size: 12px;
`;

const ActivityItemDate = styled.span`
  color: #6b7280;
  font-size: 12px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
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

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export const Dashboard: React.FC = observer(() => {
  const { leadStore, callLogStore } = useStore();
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showCallLogForm, setShowCallLogForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadDetail, setShowLeadDetail] = useState(false);

  const handleLeadFormSave = (success: boolean) => {
    if (success) {
      setShowLeadForm(false);
    }
  };

  const handleCallLogSave = (success: boolean) => {
    if (success) {
      setShowCallLogForm(false);
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadDetail(true);
  };

  const handleLeadEdit = () => {
    setShowLeadDetail(false);
    setShowLeadForm(true);
  };

  const handleLeadDetailClose = () => {
    setShowLeadDetail(false);
    setSelectedLead(null);
  };

  const recentLeads = leadStore.leads
    .slice()
    .sort(
      (a: Lead, b: Lead) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const recentCalls = callLogStore.callLogs
    .slice()
    .sort(
      (a: CallLog, b: CallLog) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 5);

  return (
    <>
      <Container>
        <BalanceSection>
          <MainBalance>
            <BalanceAmount>{leadStore.leads.length}</BalanceAmount>
            <BalanceChange>↗ +{recentLeads.length} This Week</BalanceChange>
          </MainBalance>

          <TimeFilters>
            <TimeFilter>1H</TimeFilter>
            <TimeFilter>1D</TimeFilter>
            <TimeFilter $active>1W</TimeFilter>
            <TimeFilter>1M</TimeFilter>
            <TimeFilter>1Y</TimeFilter>
            <TimeFilter>All</TimeFilter>
          </TimeFilters>

          <ChartPlaceholder>📊 Sales Performance Chart</ChartPlaceholder>
        </BalanceSection>

        <AssetsSection>
          <AssetCard>
            <AssetInfo>
              <AssetIcon
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                }}
              >
                📞
              </AssetIcon>
              <AssetDetails>
                <AssetType>Total Calls</AssetType>
                <AssetBalance>This Month</AssetBalance>
              </AssetDetails>
            </AssetInfo>
            <AssetAllocation>
              <AssetBalance>{callLogStore.callLogs.length}</AssetBalance>
              <AllocationValue>Calls Made</AllocationValue>
            </AssetAllocation>
          </AssetCard>

          <AssetCard>
            <AssetInfo>
              <AssetIcon
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                }}
              >
                ✅
              </AssetIcon>
              <AssetDetails>
                <AssetType>Conversion Rate</AssetType>
                <AssetBalance>Success Rate</AssetBalance>
              </AssetDetails>
            </AssetInfo>
            <AssetAllocation>
              <AssetBalance>{leadStore.leads.filter(l => l.status === 'Hot').length}</AssetBalance>
              <AllocationValue>Hot Leads</AllocationValue>
            </AssetAllocation>
          </AssetCard>
        </AssetsSection>

        <QuickActionsSection>
          <SectionTitle>Quick actions</SectionTitle>
          <QuickActionGrid>
            <ActionCard onClick={() => setShowLeadForm(true)}>
              <ActionIcon>👤</ActionIcon>
              <ActionText>Add New Lead</ActionText>
            </ActionCard>
            <ActionCard onClick={() => setShowCallLogForm(true)}>
              <ActionIcon>📞</ActionIcon>
              <ActionText>Log Call</ActionText>
            </ActionCard>
            <ActionCard>
              <ActionIcon>📊</ActionIcon>
              <ActionText>View Analytics</ActionText>
            </ActionCard>
            <ActionCard>
              <ActionIcon>📝</ActionIcon>
              <ActionText>Schedule Follow-up</ActionText>
            </ActionCard>
            <ActionCard>
              <ActionIcon>📋</ActionIcon>
              <ActionText>Export Reports</ActionText>
            </ActionCard>
          </QuickActionGrid>
        </QuickActionsSection>

        <RecentActivitySection>
          <ActivityCard>
            <ActivityHeader>
              <ActivityTitle>Recent Leads</ActivityTitle>
            </ActivityHeader>
            <ActivityList>
              {recentLeads.length === 0 ? (
                <EmptyState>No leads yet</EmptyState>
              ) : (
                recentLeads.map((lead: Lead) => (
                  <ActivityItem
                    key={lead.id}
                    onClick={() => handleLeadClick(lead)}
                  >
                    <ActivityItemHeader>
                      <div>
                        <ActivityItemName>{lead.name}</ActivityItemName>
                        <ActivityItemCompany>
                          {" "}
                          at {lead.company}
                        </ActivityItemCompany>
                      </div>
                      <StatusBadge status={lead.status} size="small" />
                    </ActivityItemHeader>
                    <ActivityItemDate>
                      Added {formatDate(lead.createdAt)}
                    </ActivityItemDate>
                  </ActivityItem>
                ))
              )}
            </ActivityList>
          </ActivityCard>

          <ActivityCard>
            <ActivityHeader>
              <ActivityTitle>Recent Calls</ActivityTitle>
            </ActivityHeader>
            <ActivityList>
              {recentCalls.length === 0 ? (
                <EmptyState>No calls logged yet</EmptyState>
              ) : (
                recentCalls.map((call: CallLog) => {
                  const lead = leadStore.getLeadById(call.leadId);
                  if (!lead) return null;

                  return (
                    <ActivityItem
                      key={call.id}
                      onClick={() => handleLeadClick(lead)}
                    >
                      <ActivityItemHeader>
                        <div>
                          <ActivityItemName>{lead.name}</ActivityItemName>
                          <ActivityItemCompany>
                            {" "}
                            at {lead.company}
                          </ActivityItemCompany>
                        </div>
                      </ActivityItemHeader>
                      <ActivityItemDate>
                        {call.type} • {call.duration}min •{" "}
                        {formatDate(new Date(call.date))}
                      </ActivityItemDate>
                    </ActivityItem>
                  );
                })
              )}
            </ActivityList>
          </ActivityCard>
        </RecentActivitySection>
      </Container>

      {showLeadForm && (
        <Modal>
          <LeadForm
            lead={selectedLead || undefined}
            onSave={handleLeadFormSave}
            onCancel={() => {
              setShowLeadForm(false);
              setSelectedLead(null);
            }}
          />
        </Modal>
      )}

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
