import { describe, it, expect } from "vitest";
import { AgentStateMachine, ExecutionMode, AgentState } from "../../src/core/agent/state-machine";
import { ThemeEngine } from "../../src/themes/theme-engine";
import { allThemes } from "../../src/themes/definitions";

describe("MVP-1 Local Agentic IDE Integration Test", () => {
  it("should register and switch themes properly", () => {
    const engine = new ThemeEngine();
    allThemes.forEach((t) => engine.registerTheme(t));

    expect(engine.listThemes()).toHaveLength(9);
    const active = engine.setTheme("naruto");
    expect(active.id).toBe("naruto");
    expect(active.name).toContain("Наруто");
  });

  it("should enforce Plan Mode read-only restrictions", async () => {
    const stateMachine = new AgentStateMachine();
    expect(stateMachine.mode).toBe(ExecutionMode.PLAN);

    await expect(
      stateMachine.requestToolExecution({
        id: "1",
        name: "write_file",
        parameters: { path: "test.ts" },
        isDestructive: true,
      })
    ).rejects.toThrow("forbidden in PLAN mode");
  });

  it("should require HITL approval in Act mode for destructive tools", async () => {
    const stateMachine = new AgentStateMachine();
    stateMachine.setMode(ExecutionMode.ACT);

    const toolPromise = stateMachine.requestToolExecution({
      id: "2",
      name: "execute_bash",
      parameters: { command: "echo hello" },
      isDestructive: true,
    });

    expect(stateMachine.state).toBe(AgentState.AWAITING_TOOL_APPROVAL);
    expect(stateMachine.pendingTool?.name).toBe("execute_bash");

    stateMachine.resolveApproval(true);
    const result = await toolPromise;
    expect(result).toBeDefined();
  });
});
