# 🛡️ UndeRoute Sandbox Threat Model & Execution Isolation Policy

**Version:** 1.0  
**Date:** 2026-08-14  
**Scope:** Host Security, Container Sandboxing, Permission Boundaries & Isolation Controls for `execute_bash`.

---

## 1. Threat Landscape & Boundary Model

UndeRoute Desktop Agent runs locally on the user's host OS and accepts task directives from both local UI and remote Telegram messages. Execution of arbitrary code or shell scripts (`execute_bash`) without isolation exposes the host system to Remote Code Execution (RCE), host file destruction, credential theft, and network abuse.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HOST SYSTEM (User OS / Home Directory / Host Credentials)                   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ DOCKER CONTAINER / NSJAIL SANDBOX (Deny-by-Default)                  │  │
│  │                                                                       │  │
│  │  • Read-Only Root Filesystem (rootfs)                                 │  │
│  │  • Mount: Workspace Directory ONLY (Read-Write)                       │  │
│  │  • Network: DISABLED (network-off) by default                         │  │
│  │  • Capabilities: DROPPED ALL (--cap-drop=ALL)                         │  │
│  │  • User: Non-root (uid 1000:1000)                                     │  │
│  │  • Resources: 512 MB RAM, 1 vCPU, 64 PIDs Limit                       │  │
│  │  • Timeout: 30s Hard Limit + Orphan Reaper                            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Threat Matrix & Defense Controls

| Threat Vector                    | Attack Scenario                                             | Defense Control                         | Enforcement Mechanism                                                                                                        |
| :------------------------------- | :---------------------------------------------------------- | :-------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **Path Traversal / Escape**      | Agent executes `cat /etc/shadow` or writes to `C:\Windows\` | Workspace-Only Mount & Read-Only RootFS | Container root filesystem is read-only. Only `/workspace` is mounted read-write.                                             |
| **Network Abuse / Exfiltration** | Malicious script attempts to send host secrets to C2 server | Network Isolation (`network-off`)       | Container network interfaces disabled by default (`--net=none`). Outbound connections require explicit operator HITL prompt. |
| **Privilege Escalation**         | Execution of `sudo`, `chroot`, `ptrace`, `mount`            | Drop Capabilities & Seccomp Profile     | All Linux capabilities dropped (`--cap-drop=ALL`). Custom `seccomp.json` profile blocks administrative syscalls.             |
| **Fork Bomb / DoS**              | Script spawns 10,000 sub-processes freezing host CPU/RAM    | Cgroups & PID Limits                    | Hard limits: `--pids-limit 64`, `--memory 512m`, `--cpus 1.0`.                                                               |
| **Hanging / Infinite Loop**      | Script blocks in `stdin` wait or infinite `while(true)`     | Execution Timeout & Orphan Reaper       | 30-second execution deadline. `orphan-reaper.ts` sends `SIGKILL` and destroys container after expiration.                    |

---

## 3. Human-in-the-Loop (HITL) Execution Rules

1. **Plan Mode**: Zero bash execution allowed. `execute_bash` calls throw hard exceptions.
2. **Act Mode**:
   - Safe tools (`read_file`, `list_dir`, `codebase_search`) execute automatically.
   - Destructive tools (`write_file`, `apply_diff`, `execute_bash`) REQUIRE explicit approval via UI / Telegram inline button.
3. **Approval Scope**: Approval applies ONLY to the single command requested; wildcard or durable session grants are prohibited.
