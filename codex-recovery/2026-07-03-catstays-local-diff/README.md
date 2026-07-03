# CatStays Local Recovery Diff - 2026-07-03

This folder stores the local CatStays work that was present in Codex on 2026-07-03 when the local repository was 11 commits ahead of `origin/main`.

Normal `git push` was blocked by local GitHub credentials, so this branch stores the changes as a recovery artifact in GitHub.

## What This Represents

- Repository: `vanessanz78/catstays`
- Base commit: `aec94b0d606c433f379831c0f7aceecff2967264`
- Local head represented: `645e19faa2adb770cc2cb6ebc085769507b01fcf`
- Local commits represented: 11
- Format: Python LZMA-compressed zero-context Git diff, encoded into Unicode text chunks

## Restore Instructions

From a clean checkout at, or compatible with, the base commit:

```bash
python3 - <<'PY'
from pathlib import Path
import lzma
raw_len = 46444
root = Path('codex-recovery/2026-07-03-catstays-local-diff')
alphabet = ''.join(map(chr, list(range(0x3400, 0x4DC0)) + list(range(0x4E00, 0xA000)) + list(range(0xAC00, 0xD7A4))))[:32768]
lookup = {ch: i for i, ch in enumerate(alphabet)}
encoded = ''.join(ch for i in range(5) for ch in (root / f'chunk-{i:02d}.u15').read_text(encoding='utf-8') if ch in lookup)
acc = 0
bits = 0
out = bytearray()
for ch in encoded:
    acc = (acc << 15) | lookup[ch]
    bits += 15
    while bits >= 8 and len(out) < raw_len:
        bits -= 8
        out.append((acc >> bits) & 0xff)
Path('/tmp/catstays-local-11commits-20260703.diff').write_bytes(lzma.decompress(bytes(out)))
PY
git apply /tmp/catstays-local-11commits-20260703.diff
rm -f /tmp/catstays-local-11commits-20260703.diff
```

## Notes

This branch is a recovery branch, not the final feature branch. The restored diff should be reviewed, tested, and committed normally before merging into `main`.
