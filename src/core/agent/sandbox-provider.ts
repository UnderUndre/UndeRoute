export interface ExecOptions {
  timeoutMs?: number;
  memoryLimitMB?: number;
  env?: Record<string, string>;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface ISandboxProvider {
  execute(command: string, options?: ExecOptions): Promise<ExecResult>;
  writeFile(path: string, content: Buffer | string): Promise<void>;
  readFile(path: string): Promise<Buffer | string>;
  destroy(): Promise<void>;
}
