export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  CHATBOT = 'CHATBOT',
  FORM_BUILDER = 'FORM_BUILDER'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

// Form Builder Types
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For select inputs
  placeholder?: string;
  validationRule?: string; // Description of validation logic
}

export interface GeneratedFormSchema {
  formTitle: string;
  description: string;
  fields: FormField[];
}

export interface FileUpload {
  name: string;
  mimeType: string;
  data: string; // Base64
}