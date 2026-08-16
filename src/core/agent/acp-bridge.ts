import { spawn, ChildProcess } from "child_process";
import { AnsiSanitizer } from "./ansi-sanitizer";

export interface AcpAgentSpawnOptions {
  agentBinary: string; // e.g. 'claude', 'opencode', 'aider'
  args?: string[];
  cwd: string;
  env?: Record<string, string>;
}

export class AcpBridge {
  private child: ChildProcess | null = null;

  public spawnAgent(
    options: AcpAgentSpawnOptions,
    onChunk: (cleanText: string) => void,
    onExit: (code: number) => void
  ): void {
    const spawnArgs = options.args || [];
    this.child = spawn(options.agentBinary, spawnArgs, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.child.stdout?.on("data", (data: Buffer) => {
      const cleanText = AnsiSanitizer.stripAnsi(data.toString("utf8"));
      onChunk(cleanText);
    });

    this.child.stderr?.on("data", (data: Buffer) => {
      const cleanText = AnsiSanitizer.stripAnsi(data.toString("utf8"));
      onChunk(cleanText);
    });

    this.child.on("close", (code: number) => {
      onExit(code || 0);
    });
  }

  public sendInput(text: string): void {
    if (this.child && this.child.stdin && !this.child.stdin.destroyed) {
      this.child.stdin.write(text + "\n");
    }
  }

  public kill(): void {
    if (this.child && !this.child.killed) {
      this.child.kill("SIGKILL");
    }
  }
}
