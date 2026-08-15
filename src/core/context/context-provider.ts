export interface ContextItem {
  name: string;
  description: string;
  content: string;
}

export interface IContextProvider {
  readonly selector: string;
  readonly description: string;
  resolveContext(query: string, workspacePath: string): Promise<ContextItem[]>;
}

export class FileContextProvider implements IContextProvider {
  readonly selector = "file";
  readonly description = "Injects file content into LLM context";

  async resolveContext(query: string, workspacePath: string): Promise<ContextItem[]> {
    return [
      {
        name: `@file:${query}`,
        description: `File content for ${query}`,
        content: `// Content of ${workspacePath}/${query}`,
      },
    ];
  }
}

export class TerminalContextProvider implements IContextProvider {
  readonly selector = "terminal";
  readonly description = "Injects active terminal buffer into context";

  async resolveContext(_query: string, _workspacePath: string): Promise<ContextItem[]> {
    return [
      {
        name: "@terminal",
        description: "Terminal buffer logs",
        content: "[TERMINAL LOGS]: Build succeeded. 0 errors.",
      },
    ];
  }
}

export class GitContextProvider implements IContextProvider {
  readonly selector = "git";
  readonly description = "Injects git diff into context";

  async resolveContext(_query: string, _workspacePath: string): Promise<ContextItem[]> {
    return [
      {
        name: "@git",
        description: "Current git diff",
        content: 'diff --git a/file.ts b/file.ts\n+ console.log("hello");',
      },
    ];
  }
}

export class ContextProviderRegistry {
  private providers: Map<string, IContextProvider> = new Map();

  constructor() {
    this.register(new FileContextProvider());
    this.register(new TerminalContextProvider());
    this.register(new GitContextProvider());
  }

  public register(provider: IContextProvider): void {
    this.providers.set(provider.selector, provider);
  }

  public get(selector: string): IContextProvider | undefined {
    return this.providers.get(selector);
  }
}
