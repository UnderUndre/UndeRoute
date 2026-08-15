export enum AgentState {
  IDLE = "IDLE",
  PLANNING = "PLANNING",
  AWAITING_PLAN_APPROVAL = "AWAITING_PLAN_APPROVAL",
  ACTING = "ACTING",
  AWAITING_TOOL_APPROVAL = "AWAITING_TOOL_APPROVAL",
  EXECUTING_TOOL = "EXECUTING_TOOL",
  TASK_COMPLETE = "TASK_COMPLETE",
  ERROR = "ERROR",
}

export enum ExecutionMode {
  PLAN = "PLAN",
  ACT = "ACT",
}

export interface ToolInvocation {
  id: string;
  name: string;
  parameters: Record<string, unknown>;
  isDestructive: boolean;
}

export class AgentStateMachine {
  private currentState: AgentState = AgentState.IDLE;
  private currentMode: ExecutionMode = ExecutionMode.PLAN;
  private pendingToolInvocation: ToolInvocation | null = null;
  private approvalResolver: {
    resolve: (val: unknown) => void;
    reject: (err: Error) => void;
  } | null = null;

  constructor(
    private readonly onStateChange?: (state: AgentState, mode: ExecutionMode) => void,
    private readonly toolExecutor?: (tool: ToolInvocation) => Promise<unknown>
  ) {}

  public get state(): AgentState {
    return this.currentState;
  }

  public get mode(): ExecutionMode {
    return this.currentMode;
  }

  public get pendingTool(): ToolInvocation | null {
    return this.pendingToolInvocation;
  }

  public setMode(mode: ExecutionMode): void {
    if (this.currentState === AgentState.EXECUTING_TOOL) {
      throw new Error("Cannot switch execution mode while executing a tool");
    }
    this.currentMode = mode;
    this.notifyState();
  }

  public async requestToolExecution(tool: ToolInvocation): Promise<unknown> {
    if (this.currentMode === ExecutionMode.PLAN && tool.isDestructive) {
      throw new Error(`Destructive tool execution (${tool.name}) is forbidden in PLAN mode`);
    }

    this.pendingToolInvocation = tool;

    if (tool.isDestructive) {
      this.transitionTo(AgentState.AWAITING_TOOL_APPROVAL);
      return new Promise((resolve, reject) => {
        this.approvalResolver = { resolve, reject };
      });
    }

    return this.executePendingTool();
  }

  public resolveApproval(approved: boolean, feedback?: string): void {
    if (this.currentState !== AgentState.AWAITING_TOOL_APPROVAL || !this.pendingToolInvocation) {
      throw new Error("No tool invocation currently awaiting approval");
    }

    if (!approved) {
      const error = new Error(`Tool execution rejected by operator: ${feedback || "No feedback"}`);
      if (this.approvalResolver) this.approvalResolver.reject(error);
      this.resetPending();
      this.transitionTo(
        this.currentMode === ExecutionMode.PLAN ? AgentState.PLANNING : AgentState.ACTING
      );
      return;
    }

    this.executePendingTool().then(
      (res) => this.approvalResolver?.resolve(res),
      (err) => this.approvalResolver?.reject(err)
    );
  }

  private async executePendingTool(): Promise<unknown> {
    if (!this.pendingToolInvocation) throw new Error("Missing pending tool definition");
    this.transitionTo(AgentState.EXECUTING_TOOL);

    try {
      const result = this.toolExecutor
        ? await this.toolExecutor(this.pendingToolInvocation)
        : { status: "mock_success", tool: this.pendingToolInvocation.name };
      this.transitionTo(
        this.currentMode === ExecutionMode.PLAN ? AgentState.PLANNING : AgentState.ACTING
      );
      return result;
    } catch (err) {
      this.transitionTo(AgentState.ERROR);
      throw err;
    } finally {
      this.resetPending();
    }
  }

  private transitionTo(newState: AgentState): void {
    this.currentState = newState;
    this.notifyState();
  }

  private notifyState(): void {
    if (this.onStateChange) this.onStateChange(this.currentState, this.currentMode);
  }

  private resetPending(): void {
    this.pendingToolInvocation = null;
    this.approvalResolver = null;
  }
}
