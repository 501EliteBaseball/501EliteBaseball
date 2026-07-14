import {
  ConversationAnswer,
  ConversationDefinition,
  ConversationPrompt,
  ConversationSession,
} from "./conversation-types";

export class ConversationEngine {
  private definition: ConversationDefinition;

  private session: ConversationSession;

  constructor(
    definition: ConversationDefinition,
    session?: ConversationSession
  ) {
    this.definition = definition;

    this.session =
      session ??
      {
        id: crypto.randomUUID(),

        definitionId: definition.id,

        currentPromptId: definition.prompts[0]?.id ?? "",

        progress: 0,

        answers: [],

        messages: [],

        startedAt: new Date(),

        updatedAt: new Date(),
      };
  }

  getDefinition(): ConversationDefinition {
    return this.definition;
  }

  getSession(): ConversationSession {
    return this.session;
  }

  getCurrentPrompt(): ConversationPrompt | undefined {
    return this.definition.prompts.find(
      (prompt) => prompt.id === this.session.currentPromptId
    );
  }

  getCurrentIndex(): number {
    return this.definition.prompts.findIndex(
      (prompt) => prompt.id === this.session.currentPromptId
    );
  }

  getProgress(): number {
    if (this.definition.prompts.length === 0) {
      return 100;
    }

    return Math.round(
      (this.session.answers.length /
        this.definition.prompts.length) *
        100
    );
  }

  getAnswer(promptId: string): ConversationAnswer | undefined {
    return this.session.answers.find(
      (answer) => answer.promptId === promptId
    );
  }

  answerCurrentPrompt(value: unknown): ConversationSession {
    const prompt = this.getCurrentPrompt();

    if (!prompt) {
      return this.session;
    }

    const existingIndex = this.session.answers.findIndex(
      (answer) => answer.promptId === prompt.id
    );

    const answer: ConversationAnswer = {
      promptId: prompt.id,
      value,
      answeredAt: new Date(),
    };

    if (existingIndex >= 0) {
      this.session.answers[existingIndex] = answer;
    } else {
      this.session.answers.push(answer);
    }

    this.moveNext();

    this.session.progress = this.getProgress();

    this.session.updatedAt = new Date();

    return this.session;
  }

  moveNext(): ConversationPrompt | undefined {
    const current = this.getCurrentPrompt();

    if (!current) {
      return undefined;
    }

    if (current.next) {
      this.session.currentPromptId = current.next;

      return this.getCurrentPrompt();
    }

    const index = this.getCurrentIndex();

    const next = this.definition.prompts[index + 1];

    if (next) {
      this.session.currentPromptId = next.id;

      return next;
    }

    return undefined;
  }

  movePrevious(): ConversationPrompt | undefined {
    const index = this.getCurrentIndex();

    if (index <= 0) {
      return undefined;
    }

    const previous = this.definition.prompts[index - 1];

    this.session.currentPromptId = previous.id;

    this.session.updatedAt = new Date();

    return previous;
  }

  jumpTo(promptId: string): ConversationPrompt | undefined {
    const prompt = this.definition.prompts.find(
      (item) => item.id === promptId
    );

    if (!prompt) {
      return undefined;
    }

    this.session.currentPromptId = prompt.id;

    this.session.updatedAt = new Date();

    return prompt;
  }

  isComplete(): boolean {
    return (
      this.session.answers.length >=
      this.definition.prompts.length
    );
  }

  reset(): ConversationSession {
    this.session.answers = [];

    this.session.messages = [];

    this.session.progress = 0;

    this.session.currentPromptId =
      this.definition.prompts[0]?.id ?? "";

    this.session.updatedAt = new Date();

    return this.session;
  }
}
