export type ActionType = "SCHEDULE_EVENT" | "SEND_EMAIL";

export interface ScheduleEventAction {
  type: "SCHEDULE_EVENT";
  title: string;
  description?: string;
  startTime: string; // ISO format
  endTime: string;   // ISO format
  attendees?: string[];
}

export interface SendEmailAction {
  type: "SEND_EMAIL";
  to: string;
  subject: string;
  body: string;
}

export interface ComposedActions {
  type: "COMPOSED";
  actions: (ScheduleEventAction | SendEmailAction)[];
}

export type CommandAction = ScheduleEventAction | SendEmailAction | ComposedActions;
