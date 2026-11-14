"""
Data Loader Module for NASA-FLAME AI Engine.
Responsible for loading CSV/JSON combustion datasets, validating data integrity,
and attaching provenance metadata from NASA research records.
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, Union
import pandas as pd

try:
    from .schemas import DataOrigin, ProvenanceMetadata
except (ImportError, ValueError):
    from schemas import DataOrigin, ProvenanceMetadata


METADATA_REGISTRY_PATH = Path(__file__).resolve().parent.parent / "research" / "datasets" / "metadata_registry.json"


class CombustionDataLoadError(Exception):
    """Raised when data loading fails due to file or format errors."""
    pass


COLUMN_STANDARDIZATION_MAP = {
    "flamelength": "flame_length_mm",
    "flame_length": "flame_length_mm",
    "flame_length_mm": "flame_length_mm",
    "length_mm": "flame_length_mm",
    "flamewidth": "flame_width_mm",
    "flame_width": "flame_width_mm",
    "flame_width_mm": "flame_width_mm",
    "width_mm": "flame_width_mm",
    "aspectratio": "aspect_ratio",
    "aspect_ratio": "aspect_ratio",
    "peak_temperature": "peak_temperature_k",
    "peak_temperature_k": "peak_temperature_k",
    "peak_temp_k": "peak_temperature_k",
    "temperature_k": "peak_temperature_k",
    "temp_k": "peak_temperature_k",
    "gravity": "gravity_g",
    "gravity_g": "gravity_g",
    "g_level": "gravity_g",
    "flicker_frequency": "flicker_frequency_hz",
    "flicker_hz": "flicker_frequency_hz",
    "flicker_frequency_hz": "flicker_frequency_hz",
    "soot_fraction": "soot_volume_fraction_ppm",
    "soot_volume_fraction_ppm": "soot_volume_fraction_ppm",
    "radiative_fraction": "radiative_loss_fraction",
    "radiative_loss_fraction": "radiative_loss_fraction",
    "burning_rate": "burning_rate_k_mm2_s",
    "burning_rate_k_mm2_s": "burning_rate_k_mm2_s",
    "fuel": "fuel_type",
    "fuel_type": "fuel_type",
    "data_origin": "data_origin"
}


def _load_metadata_registry() -> Dict[str, Any]:
    """Load the metadata registry JSON if it exists."""
    if METADATA_REGISTRY_PATH.exists():
        try:
            with open(METADATA_REGISTRY_PATH, "r", encoding="utf-8") as f:
                return json.load(f).get("datasets", {})
        except Exception:
            return {}
    return {}


def standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Standardize column names to standard combustion parameter naming conventions."""
    new_cols = {}
    for col in df.columns:
        norm = str(col).strip().lower().replace(" ", "_")
        standard_name = COLUMN_STANDARDIZATION_MAP.get(norm, norm)
        new_cols[col] = standard_name
    return df.rename(columns=new_cols)


def load_dataset(
    filepath_or_data: Union[str, Path, pd.DataFrame, Dict[str, Any], list],
    data_origin: Optional[Union[DataOrigin, str]] = None,
    provenance: Optional[ProvenanceMetadata] = None
) -> Tuple[pd.DataFrame, ProvenanceMetadata]:
    """
    Load combustion dataset from file path, DataFrame, or dictionary.
    
    Parameters:
    -----------
    filepath_or_data:
        Path to CSV/JSON file, or in-memory DataFrame / list of dicts.
    data_origin:
        Explicit label: EXPERIMENTAL_MEASURED, NUMERICAL_SIMULATION, or AI_PREDICTION.
    provenance:
        Optional ProvenanceMetadata instance.

    Returns:
    --------
    Tuple[pd.DataFrame, ProvenanceMetadata]:
        Cleaned standardized DataFrame and populated ProvenanceMetadata.
    """
    df: Optional[pd.DataFrame] = None
    dataset_key: Optional[str] = None
    registry = _load_metadata_registry()

    if isinstance(filepath_or_data, (str, Path)):
        path = Path(filepath_or_data)
        if not path.exists():
            # Check relative to research/datasets
            alt_path = Path(__file__).resolve().parent.parent / "research" / "datasets" / path.name
            if alt_path.exists():
                path = alt_path
            else:
                raise CombustionDataLoadError(f"Dataset file not found: {filepath_or_data}")
        
        dataset_key = path.stem
        try:
            if path.suffix.lower() == ".csv":
                df = pd.read_csv(path)
            elif path.suffix.lower() == ".json":
                df = pd.read_json(path)
            else:
                raise CombustionDataLoadError(f"Unsupported file format: {path.suffix}. Must be CSV or JSON.")
        except Exception as e:
            raise CombustionDataLoadError(f"Error parsing file {path}: {str(e)}") from e

    elif isinstance(filepath_or_data, pd.DataFrame):
        df = filepath_or_data.copy()
    elif isinstance(filepath_or_data, (list, dict)):
        df = pd.DataFrame(filepath_or_data)
    else:
        raise CombustionDataLoadError(f"Unsupported input data type: {type(filepath_or_data)}")

    if df.empty:
        raise CombustionDataLoadError("Loaded dataset is empty (0 rows).")

    df = standardize_columns(df)

    # Resolve Provenance
    if provenance is None:
        matched_info = registry.get(dataset_key, {}) if dataset_key else {}
        origin_val = data_origin
        if not origin_val:
            # Check inside dataframe column
            if "data_origin" in df.columns:
                origin_val = df["data_origin"].iloc[0]
            elif matched_info.get("data_origin"):
                origin_val = matched_info.get("data_origin")
            else:
                origin_val = DataOrigin.UNKNOWN

        try:
            enum_origin = DataOrigin(origin_val)
        except ValueError:
            enum_origin = DataOrigin.UNKNOWN

        facility_str = matched_info.get("facility", "NASA-FLAME Laboratory")
        exp_name = matched_info.get("experiment_name", "")
        if exp_name and exp_name not in facility_str:
            facility_str = f"{facility_str} / {exp_name}"

        provenance = ProvenanceMetadata(
            data_origin=enum_origin,
            facility_or_mission=facility_str,
            citation=matched_info.get("primary_citations", ["NASA Combustion Database"])[0] if matched_info.get("primary_citations") else None,
            investigators=matched_info.get("primary_investigators", []),
            sensor_tolerances=matched_info.get("sensor_tolerances", {}),
            scientific_limitations=matched_info.get("experimental_limitations", [])
        )
    else:
        if data_origin:
            provenance.data_origin = DataOrigin(data_origin)

    return df, provenance
