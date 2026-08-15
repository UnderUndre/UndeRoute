# ADR 004: Noise_XX Protocol Specification & Device Pairing Lifecycle

**Status**: Approved  
**Date**: 2026-08-14  
**Context**: UndeRoute Telegram Remote requires End-to-End encrypted authentication to prevent session hijacking and Man-in-the-Middle (MitM) attacks over relay servers.

---

## 1. Protocol Choice: Noise_XX

We select the **Noise_XX** handshake pattern (`e, s, ee, s, es, sk`) over unauthenticated WebSocket connections.

### Handshake Payload Flow

```text
Local Agent (Responder)                     Telegram Remote (Initiator)
       |                                                 |
       |<------------- e, s, es -------------------------| (Initiator Static & Ephemeral)
       |--------------- e, ee, s, es ------------------->| (Responder Static & Ephemeral)
       |<------------- s, se ----------------------------| (Handshake Complete)
       |                                                 |
   [AES-256-GCM Encrypted Transport Stream Active]
```

---

## 2. Pairing & Identity Lifecycle

1. **Local Identity Key**: X25519 Static Keypair generated at desktop startup.
2. **OTP Pairing Token**: Desktop displays 6-digit PIN (valid 5 minutes).
3. **Telegram Pairing**: User sends `/pair <PIN>` in Telegram.
4. **Device Registry**: Upon successful handshake, `Telegram ID` + `X25519 Public Key` stored in `devices` table with `status = 'ACTIVE'`.
5. **Revocation**: Desktop operator can click "Revoke Device" in IDE to instantly remove public key from whitelist.
