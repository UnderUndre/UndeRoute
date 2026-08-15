export interface UserRecord {
  id: string;
  role: string;
  createdAt: string;
}

export interface DeviceRecord {
  id: string;
  userId: string;
  name: string;
  publicKey: string;
  pairedAt: string;
  status: "ACTIVE" | "REVOKED";
}

export interface WorkspaceRecord {
  id: string;
  path: string;
  trustLevel: "RESTRICTED" | "TRUSTED";
}

export interface AgentSessionRecord {
  id: string;
  workspaceId: string;
  state: "PLAN" | "AWAITING_APPROVAL" | "ACTING" | "COMPLETED" | "ERROR";
  mode: "PLAN" | "ACT";
  createdAt: string;
}

export interface ApprovalRecord {
  id: string;
  sessionId: string;
  command: string;
  actor: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  expiresAt: string;
}

export interface AuditEventRecord {
  id: string;
  sessionId: string;
  actor: string;
  action: string;
  detailsJson: string;
  timestamp: string;
}

export const SQLITE_INIT_MIGRATION = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  public_key TEXT NOT NULL,
  paired_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'REVOKED')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL UNIQUE,
  trust_level TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_sessions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  state TEXT NOT NULL,
  mode TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  command TEXT NOT NULL,
  actor TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES agent_sessions(id)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  details_json TEXT NOT NULL,
  timestamp TEXT NOT NULL
);
`;
