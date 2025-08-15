import { useState, useEffect } from "react";
import * as React from "react";
import { observer } from "mobx-react-lite";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import * as Dialog from "@radix-ui/react-dialog";
import * as Collapsible from "@radix-ui/react-collapsible";
import {
  ArrowLeft,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../hooks/useStore";
import { CompanyForm } from "../components/CompanyForm";
import { CallLogThread } from "../components/CallLogThread";
import { StatusBadge } from "../components/StatusBadge";
import type { Company, Lead, CallLog } from "../types";

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
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--background-hover);
  }
`;

const CompanyHeader = styled.div`
  flex: 1;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
`;


const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const CompanyInfoSection = styled.div`
  background: var(--background-primary);
  padding: 24px 0;
  border-bottom: 1px solid var(--border-color);
`;

const LeadsSection = styled.div`
  background: var(--background-primary);
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 32px 24px;
`;

const DetailField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FieldValue = styled.span`
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
`;

const WebsiteLink = styled.a`
  color: var(--accent-primary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
`;

const LeadGroupContainer = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--background-primary);
`;

const LeadGroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  
  &:hover {
    background-color: var(--background-hover);
  }
`;

const LeadInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LeadName = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 16px;
`;

const LeadMeta = styled.span`
  color: var(--text-secondary);
  font-size: 14px;
`;

const CallLogCount = styled.span`
  background: var(--background-secondary);
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const CollapsibleContent = styled(Collapsible.Content)`
  padding: 20px;
  border-top: 1px solid var(--border-color);
  background: var(--background-secondary);
`;

const ScrollableThreadContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--background-secondary);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--border-hover);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
  font-size: 14px;
`;

const DialogOverlay = styled(Dialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  z-index: 1000;
`;

const DialogContent = styled(Dialog.Content)`
  background-color: var(--background-primary);
  border-radius: 6px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 600px;
  max-height: 85vh;
  padding: 0;
  z-index: 1001;
`;

const ConfirmDialogContent = styled(Dialog.Content)`
  background-color: var(--background-primary);
  border-radius: 6px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 400px;
  padding: 24px;
  z-index: 1001;
`;

const DialogTitle = styled(Dialog.Title)`
  margin: 0;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 18px;
  margin-bottom: 16px;
`;

const DialogDescription = styled(Dialog.Description)`
  margin: 0 0 20px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
`;

const DialogActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: "danger" | "secondary" }>`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;

  ${(props) =>
    props.variant === "danger"
      ? `
    background-color: var(--error);
    color: white;
    border-color: var(--error);
    
    &:hover {
      opacity: 0.9;
    }
  `
      : `
    background-color: var(--background-primary);
    color: var(--text-secondary);
    border-color: var(--border-color);
    
    &:hover {
      background-color: var(--background-hover);
    }
  `}
`;

const formatDate = (date: Date | null) => {
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const formatIndustryLabel = (industry: string) => {
  return industry.charAt(0).toUpperCase() + industry.slice(1).replace('-', ' ');
};

const formatSizeLabel = (size: string) => {
  return size.charAt(0).toUpperCase() + size.slice(1);
};

export const CompanyDetail: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companyStore, leadStore, callLogStore } = useStore();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyLeads, setCompanyLeads] = useState<Lead[]>([]);
  const [leadsWithCallLogs, setLeadsWithCallLogs] = useState<Map<string, CallLog[]>>(new Map());
  const [companyEditModalOpen, setCompanyEditModalOpen] = useState(false);
  const [companyDeleteConfirmOpen, setCompanyDeleteConfirmOpen] = useState(false);
  const [openLeadGroups, setOpenLeadGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      const foundCompany = companyStore.getCompanyById(id);
      if (foundCompany) {
        setCompany(foundCompany);
        
        // Find all leads for this company
        const leads = leadStore.leads.filter(lead => 
          lead.companyId === id || lead.company.toLowerCase() === foundCompany.name.toLowerCase()
        );
        setCompanyLeads(leads);

        // Get call logs for each lead
        const callLogMap = new Map<string, CallLog[]>();
        leads.forEach(lead => {
          const logs = callLogStore.getCallLogsByLeadId(lead.id);
          if (logs.length > 0) {
            callLogMap.set(lead.id, logs);
          }
        });
        setLeadsWithCallLogs(callLogMap);
      } else {
        navigate("/companies");
      }
    }
  }, [id, companyStore, leadStore, callLogStore, navigate]);

  const handleCompanyEdit = () => {
    setCompanyEditModalOpen(true);
  };

  const handleCompanyDelete = () => {
    setCompanyDeleteConfirmOpen(true);
  };

  const handleCompanySave = (success: boolean) => {
    if (success) {
      setCompanyEditModalOpen(false);
      // Refresh company data
      if (id) {
        const updatedCompany = companyStore.getCompanyById(id);
        if (updatedCompany) {
          setCompany(updatedCompany);
        }
      }
    }
  };

  const toggleLeadGroup = (leadId: string) => {
    setOpenLeadGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const handleEditCallLog = (callLog: CallLog) => {
    // Navigate to lead detail page for editing call log
    navigate(`/leads/${callLog.leadId}`);
  };

  const handleDeleteCallLog = (callLogId: string) => {
    const success = callLogStore.deleteCallLog(callLogId);
    if (success) {
      toast.success("Call log deleted successfully");
      // Refresh call logs
      if (id) {
        const callLogMap = new Map<string, CallLog[]>();
        companyLeads.forEach(lead => {
          const logs = callLogStore.getCallLogsByLeadId(lead.id);
          if (logs.length > 0) {
            callLogMap.set(lead.id, logs);
          }
        });
        setLeadsWithCallLogs(callLogMap);
      }
    } else {
      toast.error("Failed to delete call log");
    }
  };

  if (!company) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate("/companies")}>
          <ArrowLeft size={20} />
        </BackButton>
        <CompanyHeader>
          <PageTitle>{company.name}</PageTitle>
        </CompanyHeader>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" onClick={handleCompanyEdit}>
            <Edit size={16} style={{ marginRight: "8px" }} />
            Edit
          </Button>
          <Button variant="danger" onClick={handleCompanyDelete}>
            <Trash2 size={16} style={{ marginRight: "8px" }} />
            Delete
          </Button>
        </div>
      </Header>

      <Content>
        <CompanyInfoSection>
          <DetailGrid>
            <DetailField>
              <FieldLabel>Industry</FieldLabel>
              <FieldValue>{formatIndustryLabel(company.industry)}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Company Size</FieldLabel>
              <FieldValue>{formatSizeLabel(company.size)}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Website</FieldLabel>
              {company.website ? (
                <WebsiteLink href={company.website} target="_blank" rel="noopener noreferrer">
                  {company.website.replace(/^https?:\/\//, '')}
                  <ExternalLink size={14} />
                </WebsiteLink>
              ) : (
                <FieldValue>Not provided</FieldValue>
              )}
            </DetailField>

            <DetailField>
              <FieldLabel>Location</FieldLabel>
              <FieldValue>{company.location || "Not provided"}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Account Owner</FieldLabel>
              <FieldValue>{company.accountOwner}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Created By</FieldLabel>
              <FieldValue>{company.createdBy}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Created</FieldLabel>
              <FieldValue>{formatDate(company.createdAt)}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Last Updated</FieldLabel>
              <FieldValue>{formatDate(company.updatedAt)}</FieldValue>
            </DetailField>

            <DetailField>
              <FieldLabel>Last Contacted</FieldLabel>
              <FieldValue>{formatDate(company.lastContactedAt)}</FieldValue>
            </DetailField>

            {company.description && (
              <DetailField style={{ gridColumn: "1 / -1" }}>
                <FieldLabel>Description</FieldLabel>
                <FieldValue>{company.description}</FieldValue>
              </DetailField>
            )}

            {company.notes && (
              <DetailField style={{ gridColumn: "1 / -1" }}>
                <FieldLabel>Notes</FieldLabel>
                <FieldValue>{company.notes}</FieldValue>
              </DetailField>
            )}
          </DetailGrid>
        </CompanyInfoSection>

        <LeadsSection>
          <SectionTitle>
            Leads & Communication History ({companyLeads.length} leads)
          </SectionTitle>

          {companyLeads.length === 0 ? (
            <EmptyState>
              No leads found for this company.
            </EmptyState>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {companyLeads.map((lead) => {
                const callLogs = leadsWithCallLogs.get(lead.id) || [];
                const isOpen = openLeadGroups.has(lead.id);

                return (
                  <LeadGroupContainer key={lead.id}>
                    <Collapsible.Root open={isOpen} onOpenChange={() => toggleLeadGroup(lead.id)}>
                      <Collapsible.Trigger asChild>
                        <LeadGroupHeader>
                          <LeadInfo>
                            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            <LeadName>{lead.name}</LeadName>
                            <StatusBadge status={lead.status} />
                            <LeadMeta>
                              {lead.email} • {lead.phone}
                            </LeadMeta>
                          </LeadInfo>
                          <CallLogCount>
                            {callLogs.length} log{callLogs.length !== 1 ? 's' : ''}
                          </CallLogCount>
                        </LeadGroupHeader>
                      </Collapsible.Trigger>

                      <Collapsible.Content asChild>
                        <CollapsibleContent>
                          {callLogs.length === 0 ? (
                            <EmptyState>
                              No call logs for this lead.
                            </EmptyState>
                          ) : (
                            <ScrollableThreadContainer>
                              <CallLogThread
                                callLogs={callLogs}
                                onEditLog={handleEditCallLog}
                                onDeleteLog={handleDeleteCallLog}
                              />
                            </ScrollableThreadContainer>
                          )}
                        </CollapsibleContent>
                      </Collapsible.Content>
                    </Collapsible.Root>
                  </LeadGroupContainer>
                );
              })}
            </div>
          )}
        </LeadsSection>
      </Content>

      {/* Company Edit Modal */}
      <Dialog.Root open={companyEditModalOpen} onOpenChange={setCompanyEditModalOpen}>
        <Dialog.Portal>
          <DialogOverlay />
          <DialogContent>
            <CompanyForm
              company={company}
              onSave={handleCompanySave}
              onCancel={() => setCompanyEditModalOpen(false)}
            />
          </DialogContent>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Company Delete Confirmation Modal */}
      <Dialog.Root
        open={companyDeleteConfirmOpen}
        onOpenChange={setCompanyDeleteConfirmOpen}
      >
        <Dialog.Portal>
          <DialogOverlay />
          <ConfirmDialogContent>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {company.name}? This action cannot be undone.
              Note: This will not delete associated leads, but may break the company association.
            </DialogDescription>
            <DialogActions>
              <Dialog.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </Dialog.Close>
              <Button
                variant="danger"
                onClick={() => {
                  const success = companyStore.deleteCompany(company.id);
                  if (success) {
                    toast.success("Company deleted successfully");
                    navigate("/companies");
                  } else {
                    toast.error("Failed to delete company");
                  }
                  setCompanyDeleteConfirmOpen(false);
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </ConfirmDialogContent>
        </Dialog.Portal>
      </Dialog.Root>
    </Container>
  );
});