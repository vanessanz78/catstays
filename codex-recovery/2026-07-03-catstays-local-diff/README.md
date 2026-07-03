# CatStays local change recovery diff

Created 2026-07-03 because this Codex checkout had 11 local commits ahead of `origin/main`, but the shell could not push to GitHub because no local write credential was available.

This folder stores the full file changes from the local checkout as Unicode text chunks that decode to a gzipped Git diff.

Base:
- `origin/main`: `aec94b0d606c433f379831c0f7aceecff2967264`

Local head represented by this diff:
- `645e19faa2adb770cc2cb6ebc085769507b01fcf`

Saved local commits:
- `645e19f` Harden imported preview media and card layouts
- `2ed7efc` Keep publish success after email confirmation
- `eea5a0a` Refine imported reviews faqs and footer controls
- `9b5c628` Clean imported care services editing
- `a4ac72f` Use imported owner and gallery assets
- `5c52e58` Align builder suites and remove duplicate facility cards
- `10233c9` Keep duplicate publish errors on publish step
- `8bb2e0d` Separate imported builder sections
- `cd45a79` Persist website builder hero edits
- `8e710c7` Use imported address for onboarding location
- `437b7d4` Improve imported cattery preview coverage

## Restore in Replit or another checkout

Run from the repository root:

```bash
rm -rf .cache node_modules/.vite dist build && git fetch origin main codex/save-catstays-local-diff-20260703 && git checkout -B catstays-recovery origin/main && python3 - <<'PY'
from pathlib import Path
root = Path('/tmp/catstays-recovery-diff')
root.mkdir(exist_ok=True)
parts_root = Path.cwd() / 'codex-recovery/2026-07-03-catstays-local-diff'
if not parts_root.exists():
    import subprocess
    subprocess.run(['git', 'checkout', 'origin/codex/save-catstays-local-diff-20260703', '--', 'codex-recovery/2026-07-03-catstays-local-diff'], check=True)
raw_len = 56251
alphabet = ''.join(map(chr, list(range(0x3400, 0x4DC0)) + list(range(0x4E00, 0xA000)) + list(range(0xAC00, 0xD7A4))))[:32768]
lookup = {ch: i for i, ch in enumerate(alphabet)}
encoded = ''.join((parts_root / f'chunk-{i:02d}.u15').read_text(encoding='utf-8') for i in range(3))
acc = 0
bits = 0
out = bytearray()
for ch in encoded:
    acc = (acc << 15) | lookup[ch]
    bits += 15
    while bits >= 8 and len(out) < raw_len:
        bits -= 8
        out.append((acc >> bits) & 0xff)
(root / 'catstays-local-11commits-20260703.diff.gz').write_bytes(bytes(out))
PY
gzip -dc /tmp/catstays-recovery-diff/catstays-local-11commits-20260703.diff.gz | git apply && git status --short --branch && rm -rf /tmp/catstays-recovery-diff
```

This recreates the file changes on top of `origin/main`. The original 11 local commit messages are listed above for traceability.
