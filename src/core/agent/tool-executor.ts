import { ToolInvocation } from "./state-machine";
import { ContainerSandbox } from "./container-sandbox";

export class ToolExecutor {
  private sandbox = new ContainerSandbox();

  public async executeTool(tool: ToolInvocation, workspacePath: string): Promise<unknown> {
    switch (tool.name) {
      case "read_file":
        return { status: "success", action: "read", path: tool.parameters.path };

      case "write_file":
        return { status: "success", action: "write", path: tool.parameters.path };

      case "execute_bash":
        const cmd = String(tool.parameters.command || "");
        return await this.sandbox.executeInSandbox({
          command: cmd,
          workspacePath,
        });

      default:
        throw new Error(`Unsupported tool: ${tool.name}`);
    }
  }
}
