export const toolNames = [
  "calendar.list_events",
  "calendar.find_free_slots",
  "calendar.create_event",
  "calendar.update_event",
  "gmail.search_messages",
  "gmail.read_message",
  "finance.get_summary",
  "finance.list_due_bills",
  "finance.list_transactions",
  "reminders.create_recurring",
  "reminders.list",
  "notifications.list_recent"
] as const;

export type ToolName = (typeof toolNames)[number];
