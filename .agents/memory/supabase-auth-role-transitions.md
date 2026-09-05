---
name: Supabase auth role transitions
description: Non-obvious session timing constraints when resolving owner, staff, and customer roles from Supabase auth events.
---

Supabase can emit an auth-state sign-in event while an explicit password sign-in call is still resolving the account role. Account resolution must be single-flight for the same user and stale lookups must be invalidated when the user changes or signs out.

**Why:** Without this, an older owner, staff, or customer lookup can finish after a session transition and temporarily restore the wrong role or route.

**How to apply:** When changing authentication loading or role resolution, preserve one authoritative account lookup per user, clear user-scoped state at the start of a new lookup, and invalidate in-flight work on sign-out.