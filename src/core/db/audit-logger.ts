import { AuditEventRecord } from "./schema";

export class AuditLogger {
  private memoryLogs: AuditEventRecord[] = [];

  public logEvent(
    sessionId: string,
    actor: string,
    action: string,
    details: Record<string, unknown>
  ): AuditEventRecord {
    const record: AuditEventRecord = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sessionId,
      actor,
      action,
      detailsJson: JSON.stringify(details),
      timestamp: new Date().toISOString(),
    };

    this.memoryLogs.push(record);
    // Print structured log line for observability
    console.log(
      `[AUDIT] [${record.timestamp}] ${actor} -> ${action} (session: ${sessionId}):`,
      record.detailsJson
    );
    return record;
  }

  public getSessionLogs(sessionId: string): AuditEventRecord[] {
    return this.memoryLogs.filter((log) => log.sessionId === sessionId);
  }

  public clear(): void {
    this.memoryLogs = [];
  }
}
