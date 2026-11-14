"""Scientific Numerical Math Abstraction Layer for NASA-FLAME.

Provides high-performance vector, matrix, and grid operations with zero external
dependencies when NumPy/SciPy are not installed in the environment, while seamlessly
leveraging NumPy when available.
"""

from typing import List, Tuple, Union, Optional
import math

try:
    import numpy as _np
    _HAS_NUMPY = True
except ImportError:
    _np = None
    _HAS_NUMPY = False


def has_numpy() -> bool:
    """Return whether NumPy is installed in the active Python environment."""
    return _HAS_NUMPY


class PureArray2D:
    """A lightweight 2D numerical array supporting slicing, math, and serialization."""

    def __init__(self, data: List[List[float]]):
        self.data = data
        self.rows = len(data)
        self.cols = len(data[0]) if self.rows > 0 else 0

    @property
    def shape(self) -> Tuple[int, int]:
        return (self.rows, self.cols)

    def __getitem__(self, idx):
        if isinstance(idx, tuple):
            r, c = idx
            return self.data[r][c]
        return self.data[idx]

    def __setitem__(self, idx, value):
        if isinstance(idx, tuple):
            r, c = idx
            self.data[r][c] = float(value)
        else:
            self.data[idx] = value

    def tolist(self) -> List[List[float]]:
        return [row[:] for row in self.data]

    def min(self) -> float:
        return min(min(row) for row in self.data)

    def max(self) -> float:
        return max(max(row) for row in self.data)

    def mean(self) -> float:
        total = sum(sum(row) for row in self.data)
        count = self.rows * self.cols
        return total / count if count > 0 else 0.0


def linspace(start: float, stop: float, num: int) -> List[float]:
    """Generate linearly spaced numbers between start and stop."""
    if num <= 0:
        return []
    if num == 1:
        return [float(start)]
    step = (stop - start) / (num - 1)
    return [start + i * step for i in range(num)]


def zeros_2d(rows: int, cols: int) -> Union[PureArray2D, "_np.ndarray"]:
    """Create a 2D array of zeros."""
    if _HAS_NUMPY:
        return _np.zeros((rows, cols), dtype=float)
    return PureArray2D([[0.0 for _ in range(cols)] for _ in range(rows)])


def full_2d(rows: int, cols: int, val: float) -> Union[PureArray2D, "_np.ndarray"]:
    """Create a 2D array filled with val."""
    if _HAS_NUMPY:
        return _np.full((rows, cols), val, dtype=float)
    return PureArray2D([[float(val) for _ in range(cols)] for _ in range(rows)])


def meshgrid(r_coords: List[float], z_coords: List[float]) -> Tuple[List[List[float]], List[List[float]]]:
    """Generate 2D coordinate meshgrids for radial (r) and axial (z) directions."""
    nr = len(r_coords)
    nz = len(z_coords)
    
    if _HAS_NUMPY:
        R, Z = _np.meshgrid(r_coords, z_coords)
        return R.tolist(), Z.tolist()
        
    R = [[r_coords[c] for c in range(nr)] for _ in range(nz)]
    Z = [[z_coords[r] for _ in range(nr)] for r in range(nz)]
    return R, Z


def clip(val: float, min_val: float, max_val: float) -> float:
    """Clip a scalar value within [min_val, max_val]."""
    return max(min_val, min(val, max_val))


def exp(x: float) -> float:
    """Safe exponential with upper bound prevention."""
    if x > 700.0:
        return 1e300
    if x < -700.0:
        return 0.0
    return math.exp(x)


def sqrt(x: float) -> float:
    """Square root with positive clipping."""
    return math.sqrt(max(0.0, x))


def interp(x: float, xp: List[float], fp: List[float]) -> float:
    """1D linear interpolation."""
    if len(xp) == 0:
        return 0.0
    if x <= xp[0]:
        return fp[0]
    if x >= xp[-1]:
        return fp[-1]
    
    # Binary search
    low = 0
    high = len(xp) - 1
    while low <= high:
        mid = (low + high) // 2
        if xp[mid] <= x <= xp[mid + 1]:
            dx = xp[mid + 1] - xp[mid]
            if dx == 0:
                return fp[mid]
            t = (x - xp[mid]) / dx
            return fp[mid] + t * (fp[mid + 1] - fp[mid])
        elif xp[mid] < x:
            low = mid + 1
        else:
            high = mid - 1
    return fp[-1]
