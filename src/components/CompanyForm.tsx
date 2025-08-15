import { useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { toast } from "sonner";
import { useStore } from "../hooks/useStore";
import type { Company, Industry, CompanySize } from "../types";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

interface CompanyFormProps {
  company?: Company;
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
  background-color: var(--background-primary);
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 1px solid
    ${(props) => (props.$hasError ? "var(--error)" : "var(--border-color)")};
  border-radius: 6px;
  font-size: 14px;
  background-color: var(--background-primary);
  color: var(--text-primary);

  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.$hasError ? "var(--error)" : "var(--accent-primary)"};
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.$hasError ? "rgba(220, 38, 38, 0.1)" : "rgba(59, 130, 246, 0.1)"};
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: 10px 12px;
  border: 1px solid
    ${(props) => (props.$hasError ? "var(--error)" : "var(--border-color)")};
  border-radius: 6px;
  font-size: 14px;
  background-color: var(--background-primary);
  color: var(--text-primary);
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.$hasError ? "var(--error)" : "var(--accent-primary)"};
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.$hasError ? "rgba(220, 38, 38, 0.1)" : "rgba(59, 130, 246, 0.1)"};
  }
`;

const ErrorMessage = styled.span`
  color: var(--error);
  font-size: 12px;
  margin-top: -2px;
`;

const Title = styled.h2`
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
`;

const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;

  ${(props) => {
    if (props.variant === "secondary") {
      return `
        background-color: var(--background-primary);
        color: var(--text-primary);
        border-color: var(--border-color);
        
        &:hover {
          background-color: var(--background-hover);
          border-color: var(--border-hover);
        }
      `;
    }
    return `
      background-color: var(--accent-primary);
      color: white;
      border-color: var(--accent-primary);
      
      &:hover {
        background-color: var(--accent-hover);
        border-color: var(--accent-hover);
      }
    `;
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SelectTrigger = styled(Select.Trigger)<{ $hasError?: boolean }>`
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid
    ${(props) => (props.$hasError ? "var(--error)" : "var(--border-color)")};
  border-radius: 6px;
  font-size: 14px;
  line-height: 1;
  height: 35px;
  gap: 5px;
  background-color: var(--background-primary);
  color: var(--text-primary);
  cursor: pointer;

  &:focus {
    border-color: ${(props) =>
      props.$hasError ? "var(--error)" : "var(--accent-primary)"};
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.$hasError ? "rgba(220, 38, 38, 0.1)" : "rgba(59, 130, 246, 0.1)"};
  }
`;

const SelectContent = styled(Select.Content)`
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 4px;
  z-index: 1002;
`;

const SelectViewport = styled(Select.Viewport)`
  padding: 5px;
`;

const SelectItem = styled(Select.Item)`
  all: unset;
  font-size: 14px;
  line-height: 1;
  color: var(--text-primary);
  border-radius: 3px;
  display: flex;
  align-items: center;
  height: 35px;
  padding: 0 35px 0 25px;
  position: relative;
  user-select: none;
  cursor: pointer;

  &[data-highlighted] {
    outline: none;
    background-color: var(--background-hover);
  }
`;

export const CompanyForm: React.FC<CompanyFormProps> = observer(
  ({ company, onSave, onCancel }) => {
    const { companyStore } = useStore();
    const [formData, setFormData] = useState({
      name: company?.name || "",
      industry: company?.industry || ("fintech" as Industry),
      size: company?.size || ("startup" as CompanySize),
      website: company?.website || "",
      location: company?.location || "",
      description: company?.description || "",
      notes: company?.notes || "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const validateForm = () => {
      const newErrors: Record<string, string> = {};

      if (!formData.name.trim()) {
        newErrors.name = "Company name is required";
      } else if (formData.name.length < 2) {
        newErrors.name = "Company name must be at least 2 characters";
      } else if (companyStore.checkNameExists(formData.name, company?.id)) {
        newErrors.name = "A company with this name already exists";
      }

      if (formData.website && !isValidUrl(formData.website)) {
        newErrors.website = "Please enter a valid website URL";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (url: string): boolean => {
      try {
        new URL(url.startsWith("http") ? url : `https://${url}`);
        return true;
      } catch {
        return false;
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setSaving(true);

      try {
        let result;
        const companyData = {
          ...formData,
          website: formData.website
            ? formData.website.startsWith("http")
              ? formData.website
              : `https://${formData.website}`
            : undefined,
        };

        if (company) {
          result = companyStore.updateCompany(company.id, companyData);
          if (result) {
            toast.success("Company updated successfully");
            onSave(true);
          } else {
            toast.error("Failed to update company");
            onSave(false);
          }
        } else {
          result = companyStore.addCompany(companyData);
          if (result.success) {
            toast.success("Company added successfully");
            onSave(true);
          } else {
            toast.error(result.error || "Failed to add company");
            if (result.error?.includes("name")) {
              setErrors({ name: result.error });
            }
            onSave(false);
          }
        }
      } catch (error) {
        console.error("Error saving company:", error);
        toast.error("An error occurred while saving the company");
        onSave(false);
      } finally {
        setSaving(false);
      }
    };

    const handleInputChange = (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

    const industries: Industry[] = [
      "fintech",
      "e-commerce",
      "healthcare",
      "education",
      "gaming",
      "logistics",
      "real-estate",
      "government",
      "non-profit",
      "other",
    ];

    const companySizes: CompanySize[] = [
      "startup",
      "small",
      "medium",
      "large",
      "enterprise",
    ];

    const formatIndustryLabel = (industry: Industry) => {
      return (
        industry.charAt(0).toUpperCase() + industry.slice(1).replace("-", " ")
      );
    };

    const formatSizeLabel = (size: CompanySize) => {
      return size.charAt(0).toUpperCase() + size.slice(1);
    };

    return (
      <Form onSubmit={handleSubmit}>
        <Title>{company ? "Edit Company" : "Add New Company"}</Title>

        <FormGroup>
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter company name"
            $hasError={!!errors.name}
          />
          {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label htmlFor="industry">Industry *</Label>
            <Select.Root
              value={formData.industry}
              onValueChange={(value) =>
                handleInputChange("industry", value as Industry)
              }
            >
              <SelectTrigger $hasError={!!errors.industry}>
                <Select.Value />
                <Select.Icon>
                  <ChevronDown size={16} />
                </Select.Icon>
              </SelectTrigger>
              <Select.Portal>
                <SelectContent>
                  <SelectViewport>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        <Select.ItemText>
                          {formatIndustryLabel(industry)}
                        </Select.ItemText>
                      </SelectItem>
                    ))}
                  </SelectViewport>
                </SelectContent>
              </Select.Portal>
            </Select.Root>
            {errors.industry && <ErrorMessage>{errors.industry}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="size">Company Size *</Label>
            <Select.Root
              value={formData.size}
              onValueChange={(value) =>
                handleInputChange("size", value as CompanySize)
              }
            >
              <SelectTrigger $hasError={!!errors.size}>
                <Select.Value />
                <Select.Icon>
                  <ChevronDown size={16} />
                </Select.Icon>
              </SelectTrigger>
              <Select.Portal>
                <SelectContent>
                  <SelectViewport>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        <Select.ItemText>
                          {formatSizeLabel(size)}
                        </Select.ItemText>
                      </SelectItem>
                    ))}
                  </SelectViewport>
                </SelectContent>
              </Select.Portal>
            </Select.Root>
            {errors.size && <ErrorMessage>{errors.size}</ErrorMessage>}
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="text"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            placeholder="e.g., company.com or https://company.com"
            $hasError={!!errors.website}
          />
          {errors.website && <ErrorMessage>{errors.website}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            placeholder="e.g., San Francisco, CA"
            $hasError={!!errors.location}
          />
          {errors.location && <ErrorMessage>{errors.location}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">Description</Label>
          <TextArea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Brief description of the company..."
            $hasError={!!errors.description}
          />
          {errors.description && (
            <ErrorMessage>{errors.description}</ErrorMessage>
          )}
        </FormGroup>

        <ButtonGroup>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : company ? "Update Company" : "Add Company"}
          </Button>
        </ButtonGroup>
      </Form>
    );
  }
);
