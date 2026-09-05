---
name: Deloraine sync scope
description: Safety boundary for the Deloraine Revelation Pets worker and dashboard refresh behavior.
---

Deloraine's recurring and user-requested refreshes must use the operational/current-window scope. The older durable claimant represents the historical backlog and must not be reused for daily refreshes, or each run can rediscover historical records instead of only checking new, current, and future bookings.

**Why:** The manual-only release exposed that the historical worker and the daily operational refresh have different purposes. Mixing them causes long-running jobs, repeated arrivals updates, and confusing progress behavior.

**How to apply:** Keep the worker tenant-scoped to Deloraine, keep scheduled starts inside the Pacific/Auckland midnight window, and only notify the dashboard once a bounded manual action reaches a terminal state.