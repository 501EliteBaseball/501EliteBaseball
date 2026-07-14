export type ConversationRole = "system" | "user";

export type PromptType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "date"
  | "number"
  | "choice"
  | "multichoice"
  | "toggle"
  | "upload"
  | "signature"
  | "review";

export interface ConversationOption {
  id: string;
  label: string;
  description?: string;
}

export interface ConversationPrompt {
  id: string;
  type: PromptType;

  title: string;
  description?: string;

  required?: boolean;

  placeholder?: string;

  helperText?: string;

  options?: ConversationOption[];

  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };

  next?: string;
}

export interface ConversationAnswer {
  promptId: string;
  value: unknown;
  answeredAt: Date;
}

export interface ConversationMessage {
  id: string;

  role: ConversationRole;

  text: string;

  createdAt: Date;
}

export interface ConversationDefinition {
  id: string;

  title: string;

  description?: string;

  prompts: ConversationPrompt[];
}

export interface ConversationSession {
  id: string;

  definitionId: string;

  currentPromptId: string;

  progress: number;

  answers: ConversationAnswer[];

  messages: ConversationMessage[];

  startedAt: Date;

  updatedAt: Date;
}
