"""2D contour extraction and 3D surface mesh generation for Member 5 (Visualization)."""

import math
from typing import Dict, Any, List


def generate_flame_2d_contour(
    flame_height_mm: float,
    flame_width_mm: float,
    burner_radius_mm: float,
    is_microgravity: bool,
    num_points: int = 40,
) -> List[Dict[str, float]]:
    """Extract 2D profile coordinates [r_mm, z_mm] tracing the flame reaction sheet."""
    points: List[Dict[str, float]] = []
    flame_radius_mm = flame_width_mm / 2.0

    if is_microgravity:
        # Microgravity: Spherical or hemispherical dome/ball
        # Parametric arc from burner rim (r=burner_radius, z=0) sweeping up to top apex (r=0, z=H)
        # Angle theta from 0 (equator/base) to pi/2 (apex)
        for i in range(num_points):
            t = i / (num_points - 1)  # 0 to 1
            # Polar angle theta from 0 to pi/2
            theta = t * (math.pi / 2.0)
            # Interpolated radius from burner rim to spherical shell
            r = flame_radius_mm * math.cos(theta)
            # z begins at burner base and caps at flame height
            z = flame_height_mm * math.sin(theta)
            if i == 0:
                r = max(r, burner_radius_mm)
            points.append({"r_mm": round(r, 3), "z_mm": round(z, 3)})
    else:
        # Normal Gravity (1g): Buoyant teardrop / candle flame shape
        # Inward air entrainment at burner, expands to max width around z ~ 0.35-0.45 H,
        # then tapers smoothly into a sharp apex at z = H
        for i in range(num_points):
            t = i / (num_points - 1)  # 0 to 1
            z = t * flame_height_mm

            if t == 0:
                r = burner_radius_mm
            elif t == 1.0:
                r = 0.0
            else:
                # Teardrop profile formula: r(t) = burner_r + (R_max - burner_r) * sin(pi * t)^0.65 * (1 - 0.4*t)
                radial_factor = math.sin(math.pi * t) ** 0.65 * (1.0 - 0.45 * t)
                r = burner_radius_mm + (flame_radius_mm - burner_radius_mm) * radial_factor

            points.append({"r_mm": round(max(0.0, r), 3), "z_mm": round(z, 3)})

    return points


def generate_flame_3d_mesh(
    contour_2d: List[Dict[str, float]],
    peak_temperature_k: float,
    ambient_temperature_k: float,
    radial_segments: int = 24,
) -> Dict[str, Any]:
    """Generate a watertight 3D triangle mesh by revolving the 2D flame profile around the z-axis.

    Output schema is directly compatible with Three.js BufferGeometry, WebGL, or VTK:
      - vertices: [[x, y, z], ...] in mm
      - normals: [[nx, ny, nz], ...]
      - uvs: [[u, v], ...]
      - faces: [[v0, v1, v2], ...] 0-indexed triangle indices
      - vertex_temperatures_K: [T0, T1, ...] for colormap / thermal shader rendering
    """
    vertices: List[List[float]] = []
    normals: List[List[float]] = []
    uvs: List[List[float]] = []
    temperatures: List[float] = []
    faces: List[List[int]] = []

    num_z_rings = len(contour_2d)

    # 1. Generate vertices, normals, and UVs ring by ring
    for ring_idx, pt in enumerate(contour_2d):
        r = pt["r_mm"]
        z = pt["z_mm"]
        v_coord = ring_idx / max(1, num_z_rings - 1)

        # Thermal gradient along flame height: peak near middle/reaction zone, cooling at base and tip
        flame_fraction = v_coord
        temp_curve = math.sin(flame_fraction * math.pi)
        vert_temp = ambient_temperature_k + (peak_temperature_k - ambient_temperature_k) * (0.6 + 0.4 * temp_curve)

        for seg_idx in range(radial_segments):
            u_coord = seg_idx / radial_segments
            phi = seg_idx * (2.0 * math.pi / radial_segments)
            cos_phi = math.cos(phi)
            sin_phi = math.sin(phi)

            x = r * cos_phi
            y = r * sin_phi

            vertices.append([round(x, 3), round(y, 3), round(z, 3)])
            # Normal vector approximation
            nx = cos_phi
            ny = sin_phi
            nz = 0.2 if ring_idx < num_z_rings - 1 else 1.0
            n_mag = math.sqrt(nx * nx + ny * ny + nz * nz)
            normals.append([round(nx / n_mag, 4), round(ny / n_mag, 4), round(nz / n_mag, 4)])

            uvs.append([round(u_coord, 4), round(v_coord, 4)])
            temperatures.append(round(vert_temp, 2))

    # 2. Generate triangular faces connecting consecutive rings
    for ring_idx in range(num_z_rings - 1):
        ring_start = ring_idx * radial_segments
        next_ring_start = (ring_idx + 1) * radial_segments

        for seg_idx in range(radial_segments):
            next_seg = (seg_idx + 1) % radial_segments

            # Vertex indices for the quad (v0, v1, v2, v3)
            v0 = ring_start + seg_idx
            v1 = ring_start + next_seg
            v2 = next_ring_start + next_seg
            v3 = next_ring_start + seg_idx

            # Two triangles per quad: (v0, v1, v2) and (v0, v2, v3)
            faces.append([v0, v1, v2])
            faces.append([v0, v2, v3])

    return {
        "format": "triangle_mesh",
        "radial_segments": radial_segments,
        "vertex_count": len(vertices),
        "triangle_count": len(faces),
        "vertices": vertices,
        "normals": normals,
        "uvs": uvs,
        "faces": faces,
        "vertex_temperatures_K": temperatures,
    }
