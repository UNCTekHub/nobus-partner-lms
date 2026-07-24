# QA regression suites

End-to-end API tests for the growth modules (tier engine, earnings, MDF, support).
Run them against a **disposable** database - phase 2 writes fixtures directly into it.

```bash
# 1. Seed a throwaway DB and start the server against it
DB_PATH=/tmp/qa-test.db node seed.js
DB_PATH=/tmp/qa-test.db PORT=3101 node index.js &

# 2. Run the suites in order (from server/, so better-sqlite3 resolves)
node qa/qa-suite.mjs                            # workflows + adversarial (MDF, support, earnings)
DB_PATH=/tmp/qa-test.db node qa/qa-phase2.mjs   # money math, pricing tamper, tier gate/promotion, SLA
DB_PATH=/tmp/qa-test.db node qa/qa-team.mjs     # delegated admin: roles, resets, training, nudge, sweep

# The email suite needs both the server AND the script started with EMAIL_TEST_FILE:
#   DB_PATH=/tmp/qa-test.db PORT=3101 EMAIL_TEST_FILE=/tmp/outbox.jsonl node index.js &
DB_PATH=/tmp/qa-test.db EMAIL_TEST_FILE=/tmp/outbox.jsonl node qa/qa-email.mjs  # email pipeline, prefs, sweeps, digests
```

`EMAIL_TEST_FILE` makes every intended email append to that file as JSON, so the
suite can assert emails fire without real SMTP. Never set it in production.

The phase-2 and team suites need `DB_PATH` (they open better-sqlite3 directly to
write fixtures). Run them in the order above on one fresh DB.

`QA_BASE` overrides the API base URL (default `http://localhost:3101/api`).

Never point these at production: the suites create deals/quotes/MDF/tickets and
phase 2 UPDATEs rows (backdates tickets, grants completed paths) to build fixtures.
Credentials used are the seeded demo accounts from `seed.js`.
