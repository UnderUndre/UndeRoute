import { z } from "zod";

export const AgentStateSchema = z.enum([
  "IDLE",
  "PLANNING",
  "AWAITING_PLAN_APPROVAL",
  "ACTING",
  "AWAITING_TOOL_APPROVAL",
  "EXECUTING_TOOL",
  "TASK_COMPLETE",
  "ERROR",
]);

export const ExecutionModeSchema = z.enum(["PLAN", "ACT"]);

export const ToolInvocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  parameters: z.record(z.unknown()),
  isDestructive: z.boolean(),
});

export const PersonaThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  primaryColor: z.string(),
  backgroundColor: z.string(),
  accentColor: z.string(),
  systemPrompt: z.string(),
});
