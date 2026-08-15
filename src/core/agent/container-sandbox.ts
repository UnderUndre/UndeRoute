import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface SandboxExecutionConfig {
  command: string;
  workspacePath: string;
  timeoutMs?: number;
  memoryLimitMB?: number;
}

export interface SandboxExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class ContainerSandbox {
  private readonly defaultTimeoutMs = 30000; // 30 seconds
  private readonly defaultMemoryMB = 512;

  public async executeInSandbox(config: SandboxExecutionConfig): Promise<SandboxExecutionResult> {
    const timeout = config.timeoutMs || this.defaultTimeoutMs;
    const memory = config.memoryLimitMB || this.defaultMemoryMB;

    // Secure Docker run invocation with isolation rules
    const dockerCmd = [
      "docker run --rm",
      `--memory="${memory}m"`,
      '--cpus="1.0"',
      "--pids-limit 64",
      "--cap-drop=ALL",
      "--net=none",
      `--volume="${config.workspacePath}:/workspace:rw"`,
      "alpine:3.19",
      `/bin/sh -c "${config.command.replace(/"/g, '\\"')}"`,
    ].join(" ");

    try {
      const { stdout, stderr } = await execAsync(dockerCmd, { timeout });
      return { stdout, stderr, exitCode: 0 };
    } catch (err: unknown) {
      const execError = err as { stdout?: string; stderr?: string; code?: number };
      return {
        stdout: execError.stdout || "",
        stderr: execError.stderr || String(err),
        exitCode: execError.code || 1,
      };
    }
  }
}
