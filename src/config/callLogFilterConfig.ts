import type { CallLog, FilterOperator, FilterDataType } from "../types";

export interface CallLogFilterConfig {
  field: keyof CallLog;
  label: string;
  dataType: FilterDataType;
  operators: FilterOperator[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: { label: string; value: any }[];
}

export interface CallLogFilterCondition {
  id: string;
  field: keyof CallLog;
  operator: FilterOperator;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value2?: any;
  dataType: FilterDataType;
}

export const callLogFilterConfigs: CallLogFilterConfig[] = [
  // Text fields
  {
    field: "notes",
    label: "Notes",
    dataType: "text",
    operators: ["is_empty", "is_not_empty"],
  },
  {
    field: "caller",
    label: "Caller",
    dataType: "select",
    operators: ["equals", "not_equals", "in", "not_in", "is_empty", "is_not_empty"],
    options: [
      { label: "Sammy", value: "Sammy" },
      { label: "John", value: "John" },
      { label: "Sarah", value: "Sarah" },
      { label: "Mike", value: "Mike" },
    ],
  },

  // Select fields
  {
    field: "type",
    label: "Type",
    dataType: "select",
    operators: ["equals", "not_equals", "in", "not_in"],
    options: [
      { label: "Email", value: "email" },
      { label: "Call", value: "call" },
      { label: "WhatsApp", value: "whatsapp" },
      { label: "Conference Call", value: "conference-call" },
      { label: "Physical Meeting", value: "physical-meeting" },
      { label: "Others", value: "others" },
    ],
  },
  {
    field: "outcome",
    label: "Outcome",
    dataType: "select",
    operators: [
      "equals",
      "not_equals",
      "in",
      "not_in",
      "is_empty",
      "is_not_empty",
    ],
    options: [
      { label: "Connected", value: "connected" },
      { label: "Voicemail", value: "voicemail" },
      { label: "No Answer", value: "no-answer" },
      { label: "Busy", value: "busy" },
      { label: "Meeting Scheduled", value: "meeting-scheduled" },
      { label: "Not Interested", value: "not-interested" },
      { label: "Callback Requested", value: "callback-requested" },
    ],
  },

  // Date fields
  {
    field: "date",
    label: "Date",
    dataType: "date",
    operators: ["before", "after", "equals_date", "between_dates"],
  },
  {
    field: "scheduledFollowUp",
    label: "Scheduled Follow Up",
    dataType: "date",
    operators: [
      "before",
      "after",
      "equals_date",
      "between_dates",
      "is_empty",
      "is_not_empty",
    ],
  },
];

// Helper function to get call log filter config by field name
export const getCallLogFilterConfig = (
  field: keyof CallLog
): CallLogFilterConfig | undefined => {
  return callLogFilterConfigs.find((config) => config.field === field);
};

// Helper function to get operator label (reuse from main filter config)
export const getOperatorLabel = (operator: FilterOperator): string => {
  const operatorLabels: Record<FilterOperator, string> = {
    equals: "equals",
    not_equals: "does not equal",
    contains: "contains",
    not_contains: "does not contain",
    starts_with: "starts with",
    ends_with: "ends with",
    is_empty: "is empty",
    is_not_empty: "is not empty",
    greater_than: "greater than",
    less_than: "less than",
    greater_equal: "greater than or equal",
    less_equal: "less than or equal",
    between: "between",
    in: "is one of",
    not_in: "is not one of",
    before: "before",
    after: "after",
    equals_date: "on date",
    between_dates: "between dates",
  };

  return operatorLabels[operator] || operator;
};
