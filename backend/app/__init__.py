"""NASA-FLAME Backend Application Package."""

import sys
from pathlib import Path

# Ensure both backend directory and repo root are in python search path
current_file = Path(__file__).resolve()
backend_dir = current_file.parent.parent  # .../backend
repo_root = backend_dir.parent           # .../NASA-FLAME

for p in [str(backend_dir), str(repo_root)]:
    if p not in sys.path:
        sys.path.insert(0, p)

