import { observer } from "mobx-react-lite";
import styled from "styled-components";
import * as ContextMenu from "@radix-ui/react-context-menu";
import {
  Mail,
  Phone,
  MessageCircle,
  Video,
  MapPin,
  Users,
  Edit,
  Trash2,
} from "lucide-react";
import type { CallLog } from "../types";

interface CallLogThreadProps {
  callLogs: CallLog[];
  onEditLog?: (log: CallLog) => void;
  onDeleteLog?: (logId: string) => void;
}

const ThreadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
  font-size: 14px;
`;

const LogEntry = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--background-secondary);
  transition: all 0.2s;
  cursor: context-menu;

  &:hover {
    background: var(--background-hover);
    border-color: var(--border-hover);
  }
`;

const IconWrapper = styled.div<{ $type: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  ${(props) => {
    switch (props.$type) {
      case "email":
        return "background-color: var(--warning); color: white;";
      case "call":
        return "background-color: var(--accent-primary); color: white;";
      case "whatsapp":
        return "background-color: var(--success); color: white;";
      case "conference-call":
        return "background-color: var(--accent-primary); color: white;";
      case "physical-meeting":
        return "background-color: var(--accent-primary); color: white;";
      default:
        return "background-color: var(--background-hover); color: var(--text-muted);";
    }
  }}
`;

const LogContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const LogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const LogCaller = styled.span`
  color: var(--text-muted);
  font-size: 12px;
  margin-left: 8px;
`;

const LogType = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
`;

const LogDate = styled.span`
  color: var(--text-muted);
  font-size: 12px;
`;

const LogNotes = styled.p`
  margin: 0 0 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
`;

const LogMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ContextMenuContent = styled(ContextMenu.Content)`
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 4px;
  z-index: 1002;
`;

const ContextMenuItem = styled(ContextMenu.Item)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 4px;
  outline: none;

  &:hover,
  &[data-highlighted] {
    background-color: var(--background-hover);
  }

  &[data-color="red"]:hover {
    background-color: var(--background-hover);
    color: var(--error);
  }
`;

const getCommTypeIcon = (type: string) => {
  switch (type) {
    case "email":
      return <Mail size={20} />;
    case "call":
      return <Phone size={20} />;
    case "whatsapp":
      return <MessageCircle size={20} />;
    case "conference-call":
      return <Video size={20} />;
    case "physical-meeting":
      return <MapPin size={20} />;
    default:
      return <Users size={20} />;
  }
};

const getCommTypeLabel = (type: string) => {
  switch (type) {
    case "email":
      return "Email";
    case "call":
      return "Phone Call";
    case "whatsapp":
      return "WhatsApp";
    case "conference-call":
      return "Conference Call";
    case "physical-meeting":
      return "Physical Meeting";
    default:
      return "Communication";
  }
};

const formatDate = (date: Date) => {
  const now = new Date();
  const logDate = new Date(date);
  const diffTime = now.getTime() - logDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return `Today at ${logDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  } else if (diffDays === 2) {
    return `Yesterday at ${logDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  } else if (diffDays <= 7) {
    return logDate.toLocaleDateString("en-US", {
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } else {
    return logDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: logDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
};

export const CallLogThread: React.FC<CallLogThreadProps> = observer(
  ({ callLogs, onEditLog, onDeleteLog }) => {
    if (callLogs.length === 0) {
      return (
        <EmptyState>
          No communication history yet. Click "Log Communication" to add the
          first entry.
        </EmptyState>
      );
    }

    return (
      <ThreadContainer>
        {callLogs.map((log) => (
          <ContextMenu.Root key={log.id}>
            <ContextMenu.Trigger asChild>
              <LogEntry>
                <IconWrapper $type={log.type}>
                  {getCommTypeIcon(log.type)}
                </IconWrapper>

                <LogContent>
                  <LogHeader>
                    <div>
                      <LogType>{getCommTypeLabel(log.type)}</LogType>
                      {log.caller && <LogCaller>by {log.caller}</LogCaller>}
                    </div>
                    <LogDate>{formatDate(log.date)}</LogDate>
                  </LogHeader>

                  <LogNotes>{log.notes}</LogNotes>

                  <LogMeta>
                    {log.duration && (
                      <MetaItem>Duration: {log.duration} min</MetaItem>
                    )}
                    {log.outcome && (
                      <MetaItem>
                        Outcome:{" "}
                        {log.outcome
                          .replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </MetaItem>
                    )}
                    {log.otherPeople && (
                      <MetaItem>
                        <Users size={12} />
                        {log.otherPeople}
                      </MetaItem>
                    )}
                    {log.nextAction && (
                      <MetaItem>Next: {log.nextAction}</MetaItem>
                    )}
                  </LogMeta>
                </LogContent>
              </LogEntry>
            </ContextMenu.Trigger>

            <ContextMenu.Portal>
              <ContextMenuContent>
                {onEditLog && (
                  <ContextMenuItem onClick={() => onEditLog(log)}>
                    <Edit size={14} />
                    Edit Log
                  </ContextMenuItem>
                )}
                {onDeleteLog && (
                  <ContextMenuItem
                    data-color="red"
                    onClick={() => onDeleteLog(log.id)}
                  >
                    <Trash2 size={14} />
                    Delete Log
                  </ContextMenuItem>
                )}
              </ContextMenuContent>
            </ContextMenu.Portal>
          </ContextMenu.Root>
        ))}
      </ThreadContainer>
    );
  }
);
