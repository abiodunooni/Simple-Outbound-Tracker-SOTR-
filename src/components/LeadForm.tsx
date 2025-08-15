import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { toast } from "sonner";
import { useStore } from "../hooks/useStore";
import type { Lead, LeadStatus, DealStage, OpportunitySize, Product } from "../types";
import * as Select from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';

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
  border: 1px solid ${(props) => (props.$hasError ? "var(--error)" : "var(--border-color)")};
  border-radius: 6px;
  font-size: 14px;
  background-color: var(--background-primary);
  color: var(--text-primary);

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? "var(--error)" : "var(--accent-primary)")};
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
  color: var(--text-primary);
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
  `
      : `
    background-color: var(--background-primary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    
    &:hover {
      background-color: var(--background-hover);
    }
  `}
`;

const FormTitle = styled.h2`
  margin: 0 0 16px 0;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 700;
`;

const SelectTrigger = styled(Select.Trigger)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background-color: var(--background-primary);
  color: var(--text-primary);
  cursor: pointer;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &[data-placeholder] {
    color: var(--text-muted);
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
    background-color: var(--background-hover);
    color: var(--accent-primary);
  }
`;

const SelectIcon = styled(Select.Icon)`
  color: var(--text-muted);
`;

const ProductsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const ProductTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: var(--background-secondary);
  color: var(--accent-primary);
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--background-hover);
  }
`;

const CompanySuggestionsDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 2px;
`;

const SuggestionItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  &:hover {
    background-color: var(--background-hover);
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
`;

interface FormData {
  name: string;
  company: string;
  companyId?: string;
  phone: string;
  email: string;
  accountOwner: string;
  dealStage: DealStage;
  opportunitySize: OpportunitySize;
  products: Product[];
}

interface FormErrors {
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
}

export const LeadForm: React.FC<LeadFormProps> = observer(
  ({ lead, onSave, onCancel }) => {
    const { leadStore, companyStore } = useStore();

    const [formData, setFormData] = useState<FormData>({
      name: lead?.name || "",
      company: lead?.company || "",
      companyId: lead?.companyId || "",
      phone: lead?.phone || "",
      email: lead?.email || "",
      accountOwner: lead?.accountOwner || "Sammy",
      dealStage: lead?.dealStage || "new",
      opportunitySize: lead?.opportunitySize || "<$50k",
      products: lead?.products || [],
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
          companyId: lead.companyId || "",
          phone: lead.phone,
          email: lead.email,
          accountOwner: lead.accountOwner,
          dealStage: lead.dealStage,
          opportunitySize: lead.opportunitySize,
          products: lead.products,
        });
      }
    }, [lead]);

    const handleCompanyChange = (value: string) => {
      // Check if the value is an existing company ID
      const existingCompany = companyStore.companies.find(c => c.id === value);
      
      if (existingCompany) {
        // Selected an existing company
        setFormData(prev => ({
          ...prev,
          company: existingCompany.name,
          companyId: existingCompany.id
        }));
      } else {
        // Typed a new company name
        setFormData(prev => ({
          ...prev,
          company: value,
          companyId: undefined
        }));
      }

      // Clear company error when user selects/types something
      if (errors.company) {
        setErrors(prev => ({ ...prev, company: undefined }));
      }
    };

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
          // Handle company creation if needed for updates too
          let finalCompanyId = formData.companyId;
          
          // If no companyId but we have a company name, check if we need to create a new company
          if (!finalCompanyId && formData.company?.trim()) {
            const existingCompany = companyStore.companies.find(
              c => c.name.toLowerCase() === formData.company.trim().toLowerCase()
            );
            
            if (existingCompany) {
              finalCompanyId = existingCompany.id;
            } else {
              // Create new company
              const result = companyStore.addCompany({
                name: formData.company.trim(),
                industry: "other",
                size: "startup",
              });
              
              if (result.success && result.company) {
                finalCompanyId = result.company.id;
                toast.success(`Created new company: ${result.company.name}`);
              }
            }
          }
          
          // Update existing lead
          const success = leadStore.updateLead(lead.id, {
            name: formData.name?.trim() || "",
            company: formData.company?.trim() || "",
            companyId: finalCompanyId,
            phone: formData.phone?.trim() || "",
            email: formData.email?.trim() || "",
            accountOwner: formData.accountOwner?.trim() || "",
            status: lead.status, // Preserve existing status
            notes: lead.notes || "", // Preserve existing notes
            dealStage: formData.dealStage,
            opportunitySize: formData.opportunitySize,
            products: formData.products,
          });

          if (success) {
            toast.success("Lead updated successfully!");
          } else {
            toast.error("Failed to update lead");
          }
          onSave(success);
        } else {
          // Handle company creation if needed
          let finalCompanyId = formData.companyId;
          
          // If no companyId but we have a company name, check if we need to create a new company
          if (!finalCompanyId && formData.company?.trim()) {
            const existingCompany = companyStore.companies.find(
              c => c.name.toLowerCase() === formData.company.trim().toLowerCase()
            );
            
            if (existingCompany) {
              finalCompanyId = existingCompany.id;
            } else {
              // Create new company
              const result = companyStore.addCompany({
                name: formData.company.trim(),
                industry: "other",
                size: "startup",
              });
              
              if (result.success && result.company) {
                finalCompanyId = result.company.id;
                toast.success(`Created new company: ${result.company.name}`);
              }
            }
          }
          
          // Create new lead
          const result = leadStore.addLead({
            name: formData.name?.trim() || "",
            company: formData.company?.trim() || "",
            companyId: finalCompanyId,
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
              companyId: undefined,
              phone: "",
              email: "",
              accountOwner: "Sammy",
              dealStage: "new",
              opportunitySize: "<$50k",
              products: [],
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

    const handleInputChange = (field: keyof FormData, value: string | Product[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }

      // Check for duplicate email when email field changes
      if (field === "email" && typeof value === "string" && value?.trim()) {
        const isDuplicate = leadStore.checkEmailExists(value.trim(), lead?.id);
        setEmailExists(isDuplicate);
        if (isDuplicate) {
          toast.error("A lead with this email already exists");
        }
      }

      // Check for similar phone number when phone field changes
      if (field === "phone" && typeof value === "string" && value?.trim()) {
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

        <FormRow>
          <FormGroup>
            <Label htmlFor="company">Company *</Label>
            <div style={{ position: 'relative' }}>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleCompanyChange(e.target.value)}
                $hasError={!!errors.company}
                placeholder="Type or select company name..."
                autoComplete="off"
              />
              {formData.company && companyStore.companies.length > 0 && (
                <CompanySuggestionsDropdown>
                  {companyStore.companies
                    .filter(company => 
                      company.name.toLowerCase().includes(formData.company.toLowerCase()) &&
                      company.name.toLowerCase() !== formData.company.toLowerCase()
                    )
                    .slice(0, 5)
                    .map((company) => (
                      <SuggestionItem 
                        key={company.id}
                        onClick={() => handleCompanyChange(company.id)}
                      >
                        {company.name}
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {company.industry} • {company.size}
                        </span>
                      </SuggestionItem>
                    ))}
                </CompanySuggestionsDropdown>
              )}
            </div>
            {errors.company && <ErrorMessage>{errors.company}</ErrorMessage>}
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
        </FormRow>

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

        <FormRow>
          <FormGroup>
            <Label>Deal Stage</Label>
            <Select.Root value={formData.dealStage} onValueChange={(value) => handleInputChange("dealStage", value)}>
              <SelectTrigger>
                <Select.Value placeholder="Select deal stage..." />
                <SelectIcon>
                  <ChevronDown size={16} />
                </SelectIcon>
              </SelectTrigger>
              <Select.Portal>
                <SelectContent>
                  <Select.Viewport>
                    <SelectItem value="new">
                      <Select.ItemText>New</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="demo">
                      <Select.ItemText>Demo</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="onboarding">
                      <Select.ItemText>Onboarding</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="integrating">
                      <Select.ItemText>Integrating</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="testing">
                      <Select.ItemText>Testing</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="live">
                      <Select.ItemText>Live</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="revenue-generating">
                      <Select.ItemText>Revenue Generating</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="blocked">
                      <Select.ItemText>Blocked</Select.ItemText>
                    </SelectItem>
                  </Select.Viewport>
                </SelectContent>
              </Select.Portal>
            </Select.Root>
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
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Opportunity Size</Label>
            <Select.Root value={formData.opportunitySize} onValueChange={(value) => handleInputChange("opportunitySize", value)}>
              <SelectTrigger>
                <Select.Value placeholder="Select opportunity size..." />
                <SelectIcon>
                  <ChevronDown size={16} />
                </SelectIcon>
              </SelectTrigger>
              <Select.Portal>
                <SelectContent>
                  <Select.Viewport>
                    <SelectItem value="<$50k">
                      <Select.ItemText>Less than $50k</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="$50k-$200k">
                      <Select.ItemText>$50k - $200k</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="$500k-$1m">
                      <Select.ItemText>$500k - $1m</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="$1m-$5m">
                      <Select.ItemText>$1m - $5m</Select.ItemText>
                    </SelectItem>
                    <SelectItem value=">$5m">
                      <Select.ItemText>More than $5m</Select.ItemText>
                    </SelectItem>
                  </Select.Viewport>
                </SelectContent>
              </Select.Portal>
            </Select.Root>
          </FormGroup>

          <FormGroup>
            <Label>Products</Label>
            <Select.Root 
              value={""} 
              onValueChange={(value) => {
                if (!formData.products?.includes(value as Product)) {
                  handleInputChange("products", [...(formData.products || []), value as Product]);
                }
              }}
            >
              <SelectTrigger>
                <Select.Value placeholder="Add products..." />
                <SelectIcon>
                  <ChevronDown size={16} />
                </SelectIcon>
              </SelectTrigger>
              <Select.Portal>
                <SelectContent>
                  <Select.Viewport>
                    <SelectItem value="API">
                      <Select.ItemText>API</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="Payments">
                      <Select.ItemText>Payments</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="Ramp">
                      <Select.ItemText>Ramp</Select.ItemText>
                    </SelectItem>
                    <SelectItem value="OTC">
                      <Select.ItemText>OTC</Select.ItemText>
                    </SelectItem>
                  </Select.Viewport>
                </SelectContent>
              </Select.Portal>
            </Select.Root>
            <ProductsContainer>
              {formData.products?.map((product) => (
                <ProductTag 
                  key={product}
                  onClick={() => {
                    handleInputChange("products", (formData.products || []).filter(p => p !== product));
                  }}
                >
                  {product} ×
                </ProductTag>
              ))}
            </ProductsContainer>
          </FormGroup>
        </FormRow>

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
