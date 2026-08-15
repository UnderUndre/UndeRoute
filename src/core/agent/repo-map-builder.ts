export interface SymbolTag {
  filePath: string;
  line: number;
  name: string;
  kind: "definition" | "reference";
}

export interface RankedSymbol {
  tag: SymbolTag;
  score: number;
}

export class RepoMapBuilder {
  public buildDependencyGraph(tags: SymbolTag[]): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();
    const definitions = new Map<string, string>();

    for (const tag of tags) {
      if (tag.kind === "definition") {
        definitions.set(tag.name, tag.filePath);
      }
    }

    for (const tag of tags) {
      if (tag.kind === "reference" && definitions.has(tag.name)) {
        const targetFile = definitions.get(tag.name)!;
        if (targetFile !== tag.filePath) {
          if (!graph.has(tag.filePath)) graph.set(tag.filePath, new Set());
          graph.get(tag.filePath)!.add(targetFile);
        }
      }
    }

    return graph;
  }

  public fitToTokenBudget(rankedSymbols: RankedSymbol[], maxTokens: number): string {
    const lines = rankedSymbols
      .slice(0, Math.min(rankedSymbols.length, Math.floor(maxTokens / 10)))
      .map((s) => `${s.tag.filePath}:${s.tag.line} [${s.tag.kind}] ${s.tag.name}`);
    return lines.join("\n");
  }
}
