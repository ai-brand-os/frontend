import en from "@/messages/en.json";
import type { Messages } from "@/i18n/dictionaries";

/**
 * Real English copy, not synthetic strings. Components under test render
 * actual product copy, so assertions (`getByText(messages.auth.signin.cta)`)
 * stay true to what users see and break loudly if copy changes.
 */
export const messagesFixture: Messages = en;

export const authMessagesFixture = messagesFixture.auth;
