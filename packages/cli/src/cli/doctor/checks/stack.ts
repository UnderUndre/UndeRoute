import { evaluateStackDrift } from "../../../core/stack/drift.js";
import type { HealthCheck } from "../types.js";

export async function checkStackDrift(): Promise<HealthCheck> {
  const root = process.cwd();
  try {
    const report = await evaluateStackDrift(root);
    if (!report.hasDrift) {
      return {
        name: "stack.drift",
        category: "stack",
        status: "pass",
        detail: "Agent skills aligned with detected stack",
        critical: false,
      };
    }

    const findingSummaries = report.findings.map((f) => f.message).join("; ");
    return {
      name: "stack.drift",
      category: "stack",
      status: "fail",
      detail: `Stack drift detected: ${findingSummaries}`,
      remediation: "Run 'npx clai-helpers sync --update-stack' to auto-align agent skills",
      critical: false,
    };
  } catch (e) {
    return {
      name: "stack.drift",
      category: "stack",
      status: "fail",
      detail: `Failed to evaluate stack: ${e instanceof Error ? e.message : String(e)}`,
      critical: false,
    };
  }
}
