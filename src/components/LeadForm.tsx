import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { toast } from "sonner";
import { useStore } from "../hooks/useStore";
import type { Lead, LeadStatus } from "../types";

interface LeadFormProps {
  lead?: Lead;
  onSave: (success: boolean) => void;
  onCancel: () => void;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 600px;
  max-width: 90vw;
  padding: 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 14px;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 1px solid ${(props) => (props.$hasError ? "#dc2626" : "#d1d5db")};
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? "#dc2626" : "#3b82f6")};
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.$hasError ? "rgba(220, 38, 38, 0.1)" : "rgba(59, 130, 246, 0.1)"};
  }
`;

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 12px;
  margin-top: -2px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const ToggleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleLabel = styled.label`
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const ActionsGroup = styled.div`
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
    
    &:hover:not(:disabled) {
      background-color: #2563eb;
      border-color: #2563eb;
    }
    
    &:disabled {
      background-color: #9ca3af;
      border-color: #9ca3af;
      cursor: not-allowed;
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

const FormTitle = styled.h2`
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 700;
`;

interface FormData {
  name: string;
  company: string;
  phone: string;
  email: string;
  accountOwner: string;
}

interface FormErrors {
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
}

export const LeadForm: React.FC<LeadFormProps> = observer(
  ({ lead, onSave, onCancel }) => {
    const { leadStore } = useStore();

    const [formData, setFormData] = useState<FormData>({
      name: lead?.name || "",
      company: lead?.company || "",
      phone: lead?.phone || "",
      email: lead?.email || "",
      accountOwner: lead?.accountOwner || "Sammy",
    });

    const [createAnother, setCreateAnother] = useState(false);

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailExists, setEmailExists] = useState(false);

    useEffect(() => {
      if (lead) {
        setFormData({
          name: lead.name,
          company: lead.company,
          phone: lead.phone,
          email: lead.email,
          accountOwner: lead.accountOwner,
        });
      }
    }, [lead]);

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      if (!formData.name?.trim()) {
        newErrors.name = "Name is required";
      }

      if (!formData.company?.trim()) {
        newErrors.company = "Company is required";
      }

      if (
        formData.phone?.trim() &&
        !/^[+]?[\d\s\-()]+$/.test(formData.phone.trim())
      ) {
        newErrors.phone = "Please enter a valid phone number";
      }

      if (
        formData.email?.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
      ) {
        newErrors.email = "Please enter a valid email address";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      console.log("handle Submit");
      setIsSubmitting(true);

      try {
        if (lead) {
          // Update existing lead
          const success = leadStore.updateLead(lead.id, {
            name: formData.name?.trim() || "",
            company: formData.company?.trim() || "",
            phone: formData.phone?.trim() || "",
            email: formData.email?.trim() || "",
            accountOwner: formData.accountOwner?.trim() || "",
            status: lead.status, // Preserve existing status
            notes: lead.notes || "", // Preserve existing notes
          });

          if (success) {
            toast.success("Lead updated successfully!");
          } else {
            toast.error("Failed to update lead");
          }
          onSave(success);
        } else {
          // Create new lead
          const result = leadStore.addLead({
            name: formData.name?.trim() || "",
            company: formData.company?.trim() || "",
            phone: formData.phone?.trim() || "",
            email: formData.email?.trim() || "",
            status: "Cold" as LeadStatus,
            notes: "",
          });

          if (!result.success) {
            toast.error(result.error || "Failed to add lead");
            return;
          }

          toast.success("Lead added successfully!");

          if (createAnother) {
            // Reset form but keep modal open
            setFormData({
              name: "",
              company: "",
              phone: "",
              email: "",
              accountOwner: "Sammy",
            });
            setErrors({});
            setEmailExists(false);
          } else {
            onSave(true);
          }
        }
      } catch {
        onSave(false);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }

      // Check for duplicate email when email field changes
      if (field === "email" && value?.trim()) {
        const isDuplicate = leadStore.checkEmailExists(value.trim(), lead?.id);
        setEmailExists(isDuplicate);
        if (isDuplicate) {
          toast.error("A lead with this email already exists");
        }
      }

      // Check for similar phone number when phone field changes
      if (field === "phone" && value?.trim()) {
        const similarLead = leadStore.checkSimilarPhone(value.trim(), lead?.id);
        if (similarLead) {
          toast.warning(`${similarLead.name} from ${similarLead.company} is also using this number`);
        }
      }
    };

    return (
      <Form onSubmit={handleSubmit}>
        <FormTitle>{lead ? "Edit Lead" : "Add New Lead"}</FormTitle>

        <FormGroup>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            $hasError={!!errors.name}
            placeholder="Enter lead's full name"
          />
          {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange("company", e.target.value)}
            $hasError={!!errors.company}
            placeholder="Enter company name"
          />
          {errors.company && <ErrorMessage>{errors.company}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            $hasError={!!errors.phone}
            placeholder="Enter phone number"
          />
          {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            $hasError={!!errors.email || emailExists}
            placeholder="Enter email address"
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          {emailExists && (
            <ErrorMessage>A lead with this email already exists</ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="accountOwner">Account Owner</Label>
          <Input
            id="accountOwner"
            type="text"
            value={formData.accountOwner}
            onChange={(e) => handleInputChange("accountOwner", e.target.value)}
            placeholder="Enter account owner name"
          />
        </FormGroup>

        <ButtonGroup>
          {!lead && (
            <ToggleGroup>
              <ToggleLabel>
                <Checkbox
                  type="checkbox"
                  checked={createAnother}
                  onChange={(e) => setCreateAnother(e.target.checked)}
                />
                Create another lead
              </ToggleLabel>
            </ToggleGroup>
          )}
          <ActionsGroup>
            <Button type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              $variant="primary"
              disabled={
                isSubmitting ||
                !formData.name?.trim() ||
                !formData.company?.trim() ||
                emailExists
              }
            >
              {isSubmitting ? "Saving..." : lead ? "Update Lead" : "Add Lead"}
            </Button>
          </ActionsGroup>
        </ButtonGroup>
      </Form>
    );
  }
);
